import "@feathersjs/transport-commons";
import { HookContext, Params } from "@feathersjs/feathers";
import { Application } from "./declarations";

import { getChannelsWithReadAbility, makeOptions } from "../lib/channels";

export default function(app: Application): void {
  if(typeof app.channel !== "function") {
    // If no real-time functionality has been configured just return
    return;
  }

  app.on("connection", (connection: unknown): void => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel("anonymous").join(connection);
  });

  app.on("login", (authResult: unknown, { connection }: Params): void => {
    if(connection) {
      
      // The connection is no longer anonymous, remove it
      app.channel("anonymous").leave(connection);

      // Add it to the authenticated user channel
      app.channel("authenticated").join(connection);
    }
  });

  const caslOptions = makeOptions(app);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.publish((data: unknown, context: HookContext) => {

    const result = getChannelsWithReadAbility(app, data as Record<string, unknown>, context, caslOptions);

    // e.g. to publish all service events to all authenticated users use
    return result;
  });
}
