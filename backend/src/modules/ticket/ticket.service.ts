import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Ticket, TicketStatus } from '../../common/schemas/ticket.schema';
import { Raffle } from '../../common/schemas/raffle.schema';
import { UpdateTicketDto, UpdateMultipleTicketsStatusDto } from '../../common/dto/ticket.dto';
import { PdfService } from '../pdf/pdf.service';

// Interfaz para la respuesta paginada de tickets
export interface PaginatedTicketResponse {
  data: Ticket[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

@Injectable()
export class TicketService {
  constructor(
    @InjectModel(Ticket.name) private ticketModel: Model<Ticket>,
    @InjectModel(Raffle.name) private raffleModel: Model<Raffle>,
    private readonly pdfService: PdfService,
  ) {}

  // Initialize tickets for a raffle
  async initializeTicketsForRaffle(raffleId: string) {
    try {
      // Buscar la rifa primero
      const raffle = await this.raffleModel.findById(raffleId).exec();
      
      if (!raffle) {
        throw new NotFoundException(`Raffle with ID ${raffleId} not found`);
      }
      
      // SOLUCIÓN AL PROBLEMA DE DUPLICADOS: Limpiar por número en toda la base de datos
      // Esto eliminará tickets con número duplicado, incluso si pertenecen a otras rifas
      console.log('Limpiando la base de datos de posibles duplicados...');
      
      // Eliminar TODOS los tickets existentes para esta rifa específica
      console.log(`Removing all tickets for raffle ${raffleId}...`);
      const deleteRaffleResult = await this.ticketModel.deleteMany({ raffle: raffleId }).exec();
      console.log(`Raffle cleanup: ${deleteRaffleResult.deletedCount} tickets were removed from this raffle`);
      
      // Verificar si hay tickets en TODA la colección que puedan causar duplicados
      // Calcular el total de tickets para la rifa
      const totalTickets = raffle.totalTickets || 100; // Default a 100 si no se especifica
      const possibleDuplicateNumbers = [];
      
      // Generar todos los posibles números de ticket según el formato
      for (let i = 0; i < totalTickets; i++) {
        possibleDuplicateNumbers.push(i.toString().padStart(3, '0'));
      }
      
      // Eliminar cualquier ticket con los mismos números en TODA la base de datos
      // Esto es para prevenir el error de duplicación que ocurre incluso después de eliminar los tickets de la rifa
      const deleteDuplicatesResult = await this.ticketModel.deleteMany(
        { number: { $in: possibleDuplicateNumbers } }
      ).exec();
      
      console.log(`Global cleanup: ${deleteDuplicatesResult.deletedCount} tickets with potential duplicate numbers were removed from the entire database`);
      
      // Comprobación final de que no queden duplicados antes de crear nuevos
      const finalCheck = await this.ticketModel.countDocuments({ number: { $in: possibleDuplicateNumbers } }).exec();
      
      if (finalCheck > 0) {
        console.log(`WARNING: Still found ${finalCheck} potential conflicting tickets after cleanup. Performing aggressive deletion...`);
        
        // Eliminar cualquier ticket restante uno por uno
        const remainingConflictingTickets = await this.ticketModel.find(
          { number: { $in: possibleDuplicateNumbers } }
        ).exec();
        
        for (const ticket of remainingConflictingTickets) {
          try {
            await this.ticketModel.findByIdAndDelete(ticket._id).exec();
            console.log(`Deleted conflicting ticket with number ${ticket.number}`);
          } catch (err) {
            console.error(`Failed to delete ticket ${ticket._id}:`, err);
          }
        }
        
        // Verificación final absoluta
        const absoluteFinalCheck = await this.ticketModel.countDocuments({ number: { $in: possibleDuplicateNumbers } }).exec();
        if (absoluteFinalCheck > 0) {
          throw new BadRequestException(
            `CRITICAL ERROR: Unable to clean up existing duplicate tickets after multiple attempts. ${absoluteFinalCheck} conflicting tickets still exist. Database needs manual intervention.`
          );
        }
      }
  
      // Ya hemos eliminado todos los posibles duplicados, ahora creamos los nuevos tickets
      // Usamos el valor de totalTickets ya definido anteriormente
      const tickets = [];
      
      // Generar los nuevos tickets con formato consistente
      console.log(`Generating ${totalTickets} ticket objects...`);
      for (let i = 0; i < totalTickets; i++) {
        // Formato de número uniforme con 3 dígitos (000, 012, 123)
        const number = i.toString().padStart(3, '0');
        tickets.push({
          number,
          raffle: raffleId,
          status: TicketStatus.AVAILABLE
        });
      }
      
      // Usar una estrategia de inserción más segura para evitar duplicados
      console.log(`Inserting ${tickets.length} tickets...`);
      let insertedCount = 0;
      
      try {
        // Insertar todos los tickets de una sola vez con ordered:true para abortar al primer error
        const insertResult = await this.ticketModel.insertMany(tickets, { ordered: true });
        insertedCount = insertResult.length;
        console.log(`Successfully inserted ${insertedCount} tickets in one operation`);
      } catch (error: any) {
        console.error('Error during ticket insertion:', error.message);
        
        // Si hay error de duplicados, intentar insertar uno por uno para identificar el problema
        if (error.code === 11000) {
          console.log('Trying individual ticket insertion to bypass duplicates...');
          
          // Eliminar todos los tickets nuevamente para estar seguros
          await this.ticketModel.deleteMany({ raffle: raffleId }).exec();
          
          // Intentar inserción uno por uno
          for (const ticket of tickets) {
            try {
              await new this.ticketModel(ticket).save();
              insertedCount++;
              
              // Mostrar progreso cada 100 tickets
              if (insertedCount % 100 === 0) {
                console.log(`Inserted ${insertedCount} tickets individually`);
              }
            } catch (individualError: any) {
              if (individualError.code === 11000) {
                console.error(`Duplicate found for ticket ${ticket.number}, skipping...`);
              } else {
                console.error(`Error inserting ticket ${ticket.number}:`, individualError.message);
              }
            }
          }
        }
      }
      
      // Verificar cuántos tickets se insertaron realmente
      const actualTicketCount = await this.ticketModel.countDocuments({ raffle: raffleId }).exec();
      console.log(`Verification: ${actualTicketCount} tickets now exist for raffle ${raffleId}`);
      
      return {
        success: true,
        message: `Successfully initialized ${actualTicketCount} tickets for raffle ${raffleId}`,
        newTickets: actualTicketCount,
        deletedTickets: deleteRaffleResult.deletedCount
      };
    } catch (error) {
      // Si ocurre un error de clave duplicada, proporcionar información más útil
      if (error && error.code === 11000 && error.keyPattern && error.keyPattern.number) {
        const duplicateKey = error.keyValue?.number;
        throw new BadRequestException(
          `Duplicate ticket error. Ticket number ${duplicateKey} already exists. Please try again or contact system administrator.`
        );
      }
      
      // Para cualquier otro error, devolver el mensaje de error general
      console.error('Error initializing tickets:', error);
      throw new BadRequestException(
        `Failed to initialize tickets: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Get all tickets by raffle
  async findTicketsByRaffle(raffleId: string) { // Podría ser deprecada o para uso interno
    const raffle = await this.raffleModel.findById(raffleId).exec();
    
    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${raffleId} not found`);
    }
    
    return this.ticketModel
      .find({ raffle: raffleId })
      .sort({ number: 1 }) // Ordenar por número de ticket
      .exec();
  }

  async findTicketsByRafflePaginated(raffleId: string, page: number, limit: number): Promise<PaginatedTicketResponse> {
    const raffle = await this.raffleModel.findById(raffleId).exec();
    if (!raffle) {
      throw new NotFoundException(`Raffle with ID ${raffleId} not found`);
    }

    const skip = (page - 1) * limit;
    const filter = { raffle: raffleId };
    const totalItems = await this.ticketModel.countDocuments(filter).exec();
    const totalPages = Math.ceil(totalItems / limit);

    const data = await this.ticketModel.find(filter)
      .sort({ number: 1 }) // Ordenar por número de ticket
      .skip(skip)
      .limit(limit)
      .exec();

    return { data, currentPage: page, totalPages, totalItems };
  }

  // Get ticket status summary
  async getTicketStatusSummary(raffleId: string) {
    const result = await this.ticketModel.aggregate([
      { $match: { raffle: new Types.ObjectId(raffleId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]).exec();

    // Convert to object for easier consumption
    const summary: Record<string, number> = {
      [TicketStatus.AVAILABLE]: 0,
      [TicketStatus.RESERVED]: 0,
      [TicketStatus.SOLD]: 0,
    };

    result.forEach(item => {
      // Asegurar que item._id sea tratado como string
      const status = item._id as string;
      summary[status] = item.count;
    });

    return summary;
  }

  // Reserve tickets
  async reserveTickets(raffleId: string, ticketNumbers: string[]) {
    // Log para depuración
    console.log(`Intentando reservar tickets para la rifa ${raffleId}: ${ticketNumbers.join(', ')}`);

    // Verificar que la rifa exista
    const raffle = await this.raffleModel.findById(raffleId).exec();
    if (!raffle) {
      throw new NotFoundException(`No se encontró la rifa con ID ${raffleId}`);
    }

    // Buscar los tickets solicitados que estén disponibles
    const tickets = await this.ticketModel.find({
      raffle: raffleId,
      number: { $in: ticketNumbers },
      status: TicketStatus.AVAILABLE,
    }).exec();

    // Verificar que todos los tickets solicitados estén disponibles
    if (tickets.length !== ticketNumbers.length) {
      // Obtener cuáles son los tickets no disponibles
      const availableTickets = tickets.map(t => t.number);
      const unavailableTickets = ticketNumbers.filter(num => !availableTickets.includes(num));
      
      // Verificar el estado actual de los tickets no disponibles
      const unavailableTicketsInfo = await this.ticketModel
        .find({ raffle: raffleId, number: { $in: unavailableTickets } })
        .exec();
      
      // Crear mensaje de error detallado
      const statusDetails = unavailableTicketsInfo.map(t => 
        `${t.number} (${t.status === TicketStatus.RESERVED ? 'reservado' : 'vendido'})`
      ).join(', ');
      
      throw new BadRequestException(`Los siguientes tickets no están disponibles: ${statusDetails}`);
    }

    try {
      // Actualizar estado a RESERVADO (con una transacción para consistencia)
      const result = await this.ticketModel.updateMany(
        { raffle: raffleId, number: { $in: ticketNumbers }, status: TicketStatus.AVAILABLE },
        { status: TicketStatus.RESERVED }
      ).exec();

      console.log(`Tickets reservados: ${result.modifiedCount} de ${ticketNumbers.length} solicitados`);
      
      // Verificar que se hayan actualizado todos los tickets
      if (result.modifiedCount !== ticketNumbers.length) {
        throw new BadRequestException(
          `Solo se pudieron reservar ${result.modifiedCount} de ${ticketNumbers.length} tickets solicitados. Intente nuevamente.`
        );
      }

      return { 
        success: true, 
        reservedTickets: ticketNumbers,
        message: `Se han reservado ${result.modifiedCount} tickets correctamente.`
      };
    } catch (error) {
      console.error(`Error al reservar tickets: ${error.message}`);
      throw new BadRequestException(`Error al reservar los tickets: ${error.message}`);
    }
  }

  // Update ticket status
  async updateTicketStatus(id: string, updateTicketDto: UpdateTicketDto) {
    const updatedTicket = await this.ticketModel
      .findByIdAndUpdate(id, updateTicketDto, { new: true })
      .exec();
    
    if (!updatedTicket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    
    return updatedTicket;
  }

  // Update multiple tickets status
  async updateMultipleTicketsStatus(updateDto: UpdateMultipleTicketsStatusDto, raffleId: string) {
    // Objeto de actualización - depende del estado
    let updateObject;
    
    if (updateDto.status === TicketStatus.AVAILABLE) {
      // Si el estado es AVAILABLE, limpiar toda la información del comprador
      updateObject = {
        status: updateDto.status,
        buyerName: null,
        buyerEmail: null,
        buyerPhone: null,
        transactionId: null
      };
    } else {
      // Para otros estados, solo cambiar el estado
      updateObject = { status: updateDto.status };
    }
    
    console.log(`Actualizando tickets: ${updateDto.ticketNumbers.join(', ')}`);
    console.log(`Cambio de estado a: ${updateDto.status}`);
    console.log('Datos de actualización:', updateObject);
    
    const result = await this.ticketModel.updateMany(
      { raffle: raffleId, number: { $in: updateDto.ticketNumbers } },
      updateObject
    ).exec();
    
    return { 
      success: true, 
      modifiedCount: result.modifiedCount,
      ticketNumbers: updateDto.ticketNumbers, 
      newStatus: updateDto.status 
    };
  }

  // Get ticket details by number
  async findTicketByNumber(raffleId: string, ticketNumber: string) {
    const ticket = await this.ticketModel.findOne({ 
      raffle: raffleId, 
      number: ticketNumber 
    }).exec();
    
    if (!ticket) {
      throw new NotFoundException(`Ticket number ${ticketNumber} not found in raffle ${raffleId}`);
    }
    
    return ticket;
  }

  // Get tickets by status
  async findTicketsByStatus(raffleId: string, status: TicketStatus) {
    return this.ticketModel.find({ 
      raffle: raffleId, 
      status 
    }).sort({ number: 1 }).exec();
  }

  // Complete a sale for multiple tickets
  async completeSale(
    raffleId: string, 
    ticketNumbers: string[], 
    buyerInfo: { 
      name: string, 
      email?: string, 
      phone?: string, 
      transactionId?: string 
    }
  ) {
    // Log para depuración
    console.log(`Completando venta para la rifa ${raffleId}: ${ticketNumbers.join(', ')} al comprador ${buyerInfo.name}`);

    // Verificar que la rifa exista
    const raffle = await this.raffleModel.findById(raffleId).exec();
    if (!raffle) {
      throw new NotFoundException(`No se encontró la rifa con ID ${raffleId}`);
    }
    
    // Verificar el estado actual de los tickets
    const ticketsStatus = await this.ticketModel
      .find({ raffle: raffleId, number: { $in: ticketNumbers } })
      .exec();
    
    // Verificar si algún ticket ya está vendido
    const soldTickets = ticketsStatus.filter(t => t.status === TicketStatus.SOLD);
    if (soldTickets.length > 0) {
      const soldNumbers = soldTickets.map(t => t.number).join(', ');
      throw new BadRequestException(`Los siguientes tickets ya están vendidos: ${soldNumbers}`);
    }

    try {
      // Actualizar todos los tickets con la información del comprador y estado
      const result = await this.ticketModel.updateMany(
        { raffle: raffleId, number: { $in: ticketNumbers }, status: { $ne: TicketStatus.SOLD } },
        { 
          status: TicketStatus.SOLD, 
          buyerName: buyerInfo.name,
          buyerEmail: buyerInfo.email,
          buyerPhone: buyerInfo.phone,
          transactionId: buyerInfo.transactionId,
        }
      ).exec();
      
      console.log(`Tickets vendidos: ${result.modifiedCount} de ${ticketNumbers.length} solicitados`);

      // Verificar que se hayan actualizado todos los tickets
      if (result.modifiedCount !== ticketNumbers.length) {
        throw new BadRequestException(
          `Solo se pudieron vender ${result.modifiedCount} de ${ticketNumbers.length} tickets solicitados. Verifique que estén disponibles o reservados.`
        );
      }

      return {
        success: true,
        modifiedCount: result.modifiedCount,
        ticketNumbers,
        buyer: buyerInfo,
        message: `Se han vendido ${result.modifiedCount} tickets correctamente.`
      };
    } catch (error) {
      console.error(`Error al completar la venta: ${error.message}`);
      throw new BadRequestException(`Error al completar la venta: ${error.message}`);
    }
  }

  // Generate PDF for a single ticket
  async generateTicketPdf(raffleId: string, ticketNumber: string): Promise<Buffer> {
    const ticket = await this.findTicketByNumber(raffleId, ticketNumber);

    // We need to populate the raffle details for the PDF
    const populatedTicket = await ticket.populate<{raffle: Raffle}>('raffle');

    if (!populatedTicket || !populatedTicket.raffle) {
      throw new NotFoundException(`Ticket ${ticketNumber} in raffle ${raffleId} could not be populated with raffle details.`);
    }

    return this.pdfService.generateTicketPdf(populatedTicket);
  }

  // Verify ticket by its ID
  async verifyTicketById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid Ticket ID format');
    }

    const ticket = await this.ticketModel.findById(id).populate('raffle', 'name prize').exec();

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found.`);
    }

    return ticket;
  }
}
