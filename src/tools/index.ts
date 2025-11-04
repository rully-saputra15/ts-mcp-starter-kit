import z from "zod";
import { TRegisterTool } from "../types.js";

export const getCountryDataToolConfig = (): TRegisterTool => {
  return {
    title: "Get Country Data",
    description: "",
    inputSchema: {
        countryName: z.string().describe("Country name")
    },
    outputSchema: {
        data: z.any()
    },
  };
};
