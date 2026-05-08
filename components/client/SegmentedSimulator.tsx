"use client";

import { Property } from "@/types";
import Simulator from "./Simulator";
import CommercialSimulator from "./CommercialSimulator";

export default function SegmentedSimulator({ property }: { property: Property }) {
  if (property.segment === "cre") {
    return <CommercialSimulator property={property} />;
  }

  return <Simulator address={property.address} price={property.price} />;
}
