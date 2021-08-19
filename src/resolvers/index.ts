import { FAQsResolver } from "./FAQs";
import { UserResolver } from "./Users";

export default [
    UserResolver,
    FAQsResolver
] as const;