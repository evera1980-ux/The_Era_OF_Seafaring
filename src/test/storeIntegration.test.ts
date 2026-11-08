import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "../store";
import { selectMaxRangeNM, selectAvailablePerkPoints } from "../store/selectors/shipSelectors";
import { advanceAISFleet } from "../services/ais/deadReckoning";
import { generateInitialSyntheticFleet } from "../services/ais/syntheticVesselGenerator";

describe("Zustand Store Integration & Dynamic Selectors", () => {
  beforeEach(() => {
    useGameStore.setState({
      playerCredits: 50000 as any,
      playerLevel: 5,
      ownedVesselIds: ["V001", "V002"],
      unlockedPerkIds: [],
      collectedAISIds: [],
    });
  });

  it("switches vessels and dynamically scales Fuel Range Ring with Engine Telegraph", () => {
    const store = useGameStore.getState();
    store.switchVessel("V002");

    const v002AfterSwitch = useGameStore.getState().activeVessel;
    expect(v002AfterSwitch.vesselId).toBe("V002");
    expect(v002AfterSwitch.propulsionMode).toBe("Diesel");
    expect(v002AfterSwitch.supplies.fuelT).toBeGreaterThan(0);

    useGameStore.getState().setEngineTelegraph("ECO");
    const ecoRange = selectMaxRangeNM(useGameStore.getState().activeVessel);

    useGameStore.getState().setEngineTelegraph("FLANK");
    const flankRange = selectMaxRangeNM(useGameStore.getState().activeVessel);

    // FLANK 极速油耗远高于 ECO，因此续航半径必定显著缩小
    expect(ecoRange).toBeGreaterThan(flankRange);
  });

  it("installs modular upgrades, unlocks captain perks, and spots AIS vessels", () => {
    const installed = useGameStore.getState().installUpgrade("U001");
    expect(installed).toBe(true);
    expect(
      useGameStore
        .getState()
        .activeVessel.installedUpgrades.some((u) => u.upgradeId === "U001")
    ).toBe(true);

    const perkUnlocked = useGameStore.getState().unlockPerk("PERK_EFFICIENT_ENGINE");
    expect(perkUnlocked).toBe(true);
    expect(useGameStore.getState().unlockedPerkIds).toContain("PERK_EFFICIENT_ENGINE");

    const remainingPts = selectAvailablePerkPoints(
      useGameStore.getState().playerLevel,
      useGameStore.getState().unlockedPerkIds
    );
    expect(remainingPts).toBe(4);

    const spotted = useGameStore.getState().collectAISTarget("AIS_412356789");
    expect(spotted).toBe(true);
    expect(useGameStore.getState().collectedAISIds).toContain("AIS_412356789");
  });

  it("advances AIS fleet positions via Dead Reckoning kinematics", () => {
    const fleet = generateInitialSyntheticFleet();
    expect(fleet.length).toBeGreaterThanOrEqual(20);
    const firstBefore = fleet[0].position;
    const movedFleet = advanceAISFleet(fleet, 600);
    const firstAfter = movedFleet[0].position;
    expect(firstAfter.latitude).not.toBe(firstBefore.latitude);
  });

  it("propels initial Sail vessel V001 forward under Autopilot even in direct headwind", async () => {
    const { simulateTick } = await import("../core/simulation/tick");
    useGameStore.getState().switchVessel("V001");
    useGameStore.getState().setEngineTelegraph("FULL");
    const v001 = useGameStore.getState().activeVessel;

    // 模拟 0° 正逆风 (windDirectionDeg === headingDeg)
    const headwindWeather = {
      ...useGameStore.getState().currentWeather,
      windDirectionDeg: v001.headingDeg,
      windSpeedKn: 14 as any,
    };

    const tickRes = simulateTick({
      vesselState: v001,
      weather: headwindWeather,
      waterDepthM: 35,
      dtSeconds: 300,
    });

    expect(tickRes.nextVesselState.sogKn).toBeGreaterThan(5);
    expect(tickRes.distanceAdvancedNM).toBeGreaterThan(0.4);
    expect(tickRes.nextVesselState.position.latitude).not.toBe(v001.position.latitude);
  });
});
