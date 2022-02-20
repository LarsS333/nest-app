import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {User} from "./users.model";
import {InjectModel} from "@nestjs/sequelize";
import {CreateUserDto} from "./dto/create-user.dto";
import {RolesService} from "../roles/roles.service";
import {AddRoleDto} from "./dto/add-role.dto";
import {BanUserDto} from "./dto/ban-user.dto";
import { Role } from "../roles/roles.model";

// service - он же провайдер, нужен для вынесения логики приложения, чтобы класс стал провайдером, нужно пометить его @Injectable(), в дальнейшем он внедряется в controller "делаем инъекцию"

// описывваем всю логику провайдера

@Injectable() // один из декораторов
export class UsersService {
    
    // внедряем модель используя конструктор
    constructor(@InjectModel(User) private userRepository: typeof User,
    private roleService: RolesService) {}

    async createUser(dto: CreateUserDto) {
        const user = await this.userRepository.create(dto);
        const role = await this.roleService.getRoleByValue("ADMIN")
        // await user.$set('roles', [role.id])
        // user.roles = [role]
        return user; // возвращаем пользователя
    }

    async getAllUsers() {
        // метод получения всех пользователей
        const users = await this.userRepository.findAll({
            include: {
                model: Role,
                // attributes: ['value'],   
            }
        });
        console.log(users, ">>>>>>>>>>>>role")
        return users;
    }

    async getUserByEmail(email: string) {
        // метод получения Email
        const user = await this.userRepository.findOne({where: {email}, include: {all: true}})
        return user;
    }

    async addRole(dto: AddRoleDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        const role = await this.roleService.getRoleByValue(dto.value);
        if (role && user) {
            await user.$add('role', role.id);
            return dto;
        }
        throw new HttpException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    }

    async ban(dto: BanUserDto) {
        const user = await this.userRepository.findByPk(dto.userId);
        if (!user) {
            throw new HttpException('Пользователь не найден', HttpStatus.NOT_FOUND);
        }
        user.banned = true;
        user.banReason = dto.banReason;
        await user.save();
        return user;
    }
}


