import { describe, expect, it } from "vitest";
import { nativeDestination } from "./native-routing";

describe("nativeDestination", () => {
  it("routes verified Party and Games links", () => {
    expect(nativeDestination("https://party.xmasgoat.com/events/party-1?tab=food")).toBe(
      "https://party.xmasgoat.com/events/party-1?tab=food",
    );
    expect(nativeDestination("https://games.xmasgoat.com/join?code=ABC234")).toBe(
      "https://games.xmasgoat.com/join?code=ABC234",
    );
  });

  it("supports the unified and legacy app schemes", () => {
    expect(
      nativeDestination(
        "xmasgoat://open?url=https%3A%2F%2Fparty.xmasgoat.com%2Fevents%2Fparty-1",
      ),
    ).toBe("https://party.xmasgoat.com/events/party-1");
    expect(nativeDestination("gamegoat://open?target=%2Fkris-kringle%2Froom%2FABC234")).toBe(
      "https://games.xmasgoat.com/kris-kringle/room/ABC234",
    );
  });

  it("rejects untrusted and malformed destinations", () => {
    expect(nativeDestination("xmasgoat://open?url=https%3A%2F%2Fevil.example%2Flogin")).toBe(
      "https://games.xmasgoat.com/app",
    );
    expect(nativeDestination("gamegoat://open?target=%2F%2Fevil.example")).toBeNull();
    expect(nativeDestination("not a url")).toBeNull();
  });
});
