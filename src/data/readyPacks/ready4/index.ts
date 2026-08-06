export { ready4StudyPack } from "./study";
export { ready4HomePack } from "./home";
export { ready4FinancePack } from "./finance";
export { ready4MedicationPack } from "./medication";
export { ready4WorkPack } from "./work";
export { ready4FamilyPack } from "./family";
export { ready4TravelPack } from "./travel";
export { ready4WellbeingPack } from "./wellbeing";
export { ready4ShoppingPack } from "./shopping";
export { ready4IndependencePack } from "./independence";
export { ready4AppointmentsPack } from "./appointments";
export { ready4PetsPack } from "./pets";
export { ready4DigitalLifePack } from "./digitalLife";
export { ready4LifeAdminPack } from "./lifeAdmin";
export { ready4EmergenciesPack } from "./emergencies";

import { ready4AppointmentsPack } from "./appointments";
import { ready4DigitalLifePack } from "./digitalLife";
import { ready4EmergenciesPack } from "./emergencies";
import { ready4FamilyPack } from "./family";
import { ready4FinancePack } from "./finance";
import { ready4HomePack } from "./home";
import { ready4IndependencePack } from "./independence";
import { ready4LifeAdminPack } from "./lifeAdmin";
import { ready4MedicationPack } from "./medication";
import { ready4PetsPack } from "./pets";
import { ready4ShoppingPack } from "./shopping";
import { ready4StudyPack } from "./study";
import { ready4TravelPack } from "./travel";
import { ready4WellbeingPack } from "./wellbeing";
import { ready4WorkPack } from "./work";
import type { ReadyPack } from "../../../types/readyPacks";

/** Edition 1 Ready 4 content catalogue (order matches commercial Volume 2). */
export const ready4ContentPacks: ReadyPack[] = [
  ready4StudyPack,
  ready4HomePack,
  ready4FinancePack,
  ready4MedicationPack,
  ready4WorkPack,
  ready4FamilyPack,
  ready4TravelPack,
  ready4WellbeingPack,
  ready4ShoppingPack,
  ready4IndependencePack,
  ready4AppointmentsPack,
  ready4PetsPack,
  ready4DigitalLifePack,
  ready4LifeAdminPack,
  ready4EmergenciesPack
];
