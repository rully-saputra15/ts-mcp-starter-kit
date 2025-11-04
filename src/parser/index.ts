import z from "zod";

export const getCountryDataParser = z.object({
    countryName: z.string()
})