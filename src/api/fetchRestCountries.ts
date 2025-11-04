const fetchRestCountries = async (countryName: string) => {
  try {
    const headers = {};
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${countryName}`,
      { headers }
    );
    const resJson = await res.json();
    return resJson;
  } catch (err) {
    console.error(`Failed to fetch country data`);
    return "Failed to fetch country data";
  }
};

export default fetchRestCountries;