import { Module } from '@nestjs/common'
import { SessionRepository } from './session.repository.js'
import { SESSION_REPOSITORY } from './session.repository.interface.js'

@Module({
  providers: [{ provide: SESSION_REPOSITORY, useClass: SessionRepository }],
  exports: [SESSION_REPOSITORY],
})
export class SessionModule {}
