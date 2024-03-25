await fetch("https://api.superform.xyz/explorer/transactions?offset=0&limit=100", {
    "credentials": "omit",
    "headers": {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.5",
        "cache-control": "public, s-maxage=1200, stale-while-revalidate=600",
        "response-content-type": "application/json",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-site"
    },
    "referrer": "https://scan.superform.xyz/",
    "method": "GET",
    "mode": "cors"
});