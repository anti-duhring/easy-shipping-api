import { repl } from "@nestjs/core";
import { AppModule } from "./app.module";

void async function bootstrap() {
    await repl(AppModule)
}()