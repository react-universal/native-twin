import * as Ctx from 'effect/Context';

export class ServerServiceContext extends Ctx.Tag('ServerServiceContext')<
  ServerServiceContext,
  {
    readonly subscriptions: string;
  }
>() {}
