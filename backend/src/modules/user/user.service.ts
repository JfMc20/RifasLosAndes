import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../common/schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: any): Promise<User> {
    // Verificamos que el usuario exista
    const user = await this.userModel.findById(id);
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    // Si se está actualizando la contraseña, la encriptamos
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // Actualizamos el usuario
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        { ...updateUserDto, updatedAt: new Date() },
        { new: true }
      )
      .select('-password')
      .exec();
      
    if (!updatedUser) {
      throw new NotFoundException(`No se pudo actualizar el usuario con ID ${id}`);
    }
      
    return updatedUser;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }
  
  /**
   * Cambia la contraseña de un usuario verificando primero la contraseña actual
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    // Obtenemos el usuario con la contraseña (no usamos select('-password') aquí)
    const user = await this.userModel.findById(id).exec();
    
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    
    // Verificamos que la contraseña actual sea correcta
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }
    
    // Encriptamos la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Actualizamos la contraseña del usuario
    await this.userModel.updateOne(
      { _id: id },
      { password: hashedPassword, updatedAt: new Date() }
    ).exec();
  }
}
