import { EventResolver } from "./Event";
import { EventFAQResolver } from "./EventFAQ";
import { FAQsResolver } from "./FAQs";
import { UserResolver } from "./Users";

export default [
    UserResolver,
    EventResolver,
    EventFAQResolver,
    FAQsResolver
] as const;