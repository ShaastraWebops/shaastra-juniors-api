import { EventResolver } from "./Event";
import { EventFAQResolver } from "./EventFAQ";
import { FAQsResolver } from "./FAQs";
import { TeamResolver } from "./Team";
import { UserResolver } from "./Users";

export default [
    UserResolver,
    EventResolver,
    EventFAQResolver,
    TeamResolver,
    FAQsResolver
] as const;