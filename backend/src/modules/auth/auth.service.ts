import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../../common/schemas/user.schema';
import { LoginDto, RegisterUserDto } from '../../common/dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {
    // Create initial admin user when service initializes
    this.createInitialAdmin();
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user._id,
      username: user.username,
      role: user.role,
    };

    return {
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterUserDto) {
    const { username, password, fullName, email } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ username });
    if (existingUser) {
      throw new UnauthorizedException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default role USER
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      fullName,
      email,
      role: UserRole.USER,
    });

    const savedUser = await newUser.save();

    const payload = {
      sub: savedUser._id,
      username: savedUser.username,
      role: savedUser.role,
    };

    return {
      user: {
        id: savedUser._id,
        username: savedUser.username,
        role: savedUser.role,
        fullName: savedUser.fullName,
      },
      accessToken: this.jwtService.sign(payload),
    };
  }

  async createInitialAdmin() {
    const existingAdmin = await this.userModel.findOne({ role: UserRole.ADMIN });

    if (!existingAdmin) {
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const adminUser = new this.userModel({
        username: 'admin',
        password: hashedPassword,
        role: UserRole.ADMIN,
        fullName: 'Administrator',
        email: 'admin@rifalosandes.com',
      });

      await adminUser.save();
      console.log('Initial admin user created');
    }
  }
}
