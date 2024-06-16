export const generateAppModule = (data) => {
  const { name, author, dbType, dbname, serviceBus } = data;

  const template = `import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './core/database/database';
import { NoteModule } from '@modules/note/note.module';
import { EmailModule } from '@modules/email/email.module';
${serviceBus ? "import { QueueModule } from '@modules/queue/queue.module';" : ""}

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    UserModule,
    AuthModule,
    NoteModule,
    ${serviceBus ? "QueueModule," : ""}
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

  `;
  return template;
};
