import { BaseCrudService } from "./integrations/cms/service";

const result = await BaseCrudService.getAll("products");

console.log(result);