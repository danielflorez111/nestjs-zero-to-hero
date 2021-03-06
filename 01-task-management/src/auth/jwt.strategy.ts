import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Strategy, ExtractJwt } from 'passport-jwt';
import * as config from 'config';

import { JwtPayload } from './dto/jwt-payload.interface';
import { UserRepository } from './user.repository';
import { User } from './user.entity';

const jwtConfig = config.get('jwt');

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || jwtConfig.secret
        });
    }

    async validate(payload: JwtPayload): Promise<User> {
        const { username } = payload;
        const user = await this.userRepository.findOne({ username });

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}
