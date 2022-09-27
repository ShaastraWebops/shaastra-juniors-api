import { ApolloServer } from "apollo-server-express";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import dotenv from "dotenv";
import resolvers from "./resolvers";
import entities from "./entities";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import { User } from "./entities/User";
import { authChecker } from "./utils/auth";

dotenv.config();

const main = async () => {
  const schema = await buildSchema({ resolvers, authChecker });

  const server = new ApolloServer({
    schema,
    context: async ( { req, res } : { req: express.Request, res: express.Response } ) => {
      let user;
      console.log(req.headers.cookie)
      if(req.headers.cookie) {
        console.log(req.cookies)
        const token = req.headers.cookie.split("token=")[1];
        if(token){
          const decoded = jwt.verify(token, process.env.JWT_SECRET ||  "secret" ) as any;
          user = await User.findByIds(decoded.id);
          user = user[0];
        }
       
      }
      return { req, res, user };
    },
  });

  await server.start();

  const app = express();
  app.use(cookieParser());

  app.use( 
    cors({
      credentials: true,
      origin:["https://studio.apollographql.com", "http://localhost:8000/graphql",'http://localhost:3000', 'https://juniors.shaastra.org', 'https://plankton-app-6laji.ondigitalocean.app/', 'https://api.juniors.shaastra.org']
    })
  );
  //await server.start();

  //const app = express();
  server.applyMiddleware({ app, cors: false });
  
  //await new Promise(resolve => app.listen({ port: 4000 }, resolve));
  //await new Promise(r => app.listen({ port: 4000 }, r));
  app.listen(8000)
  console.log(`🚀 Server ready at http://localhost:8000${server.graphqlPath}`);

  // server.listen(process.env.PORT || 8000).then(({ url }) => {
  //   console.log(`Server started at ${url}`);
  // });
  };
  
createConnection({
  type: "postgres",
  url: 'postgres//doadmin:AVNS_aPiBcNCbKniFtJwhvLC@db-postgresql-blr1-95873-do-user-7555493-0.b.db.ondigitalocean.com::25060/defaultdb',
  entities,
  synchronize: true,
  logging: true,
})
.then(() => {
  console.log('Database Connected');
  main();
})
.catch((e) => console.log(e))