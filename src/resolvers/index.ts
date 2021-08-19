import { EventResolver } from "./Event";
import { FAQsResolver } from "./FAQs";
import { UserResolver } from "./Users";

export default [
    UserResolver,
    EventResolver,
    FAQsResolver
] as const;