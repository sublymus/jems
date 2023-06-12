import { SQuery } from "../lib/squery/SQuery";

SQuery.auth({
  login: "account",
  match: ["telephone", "password"],
  signup: "user",
});

SQuery.auth({
  login: "account",
  match: ["telephone", "password"],
  signup: "manager",
});
