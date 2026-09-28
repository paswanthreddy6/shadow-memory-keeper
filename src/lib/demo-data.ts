import {
  competitorToMemory,
  decisionToMemory,
  feedbackToMemory,
  meetingToMemory,
  type MemoryDraft,
} from "./memory-schemas";

/** Fictional NovaCart storyline. Clearly labelled as demo data. */
export function buildDemoMemories(): MemoryDraft[] {
  const drafts: MemoryDraft[] = [
    feedbackToMemory({
      title: "Forced account creation blocks purchase",
      customer: "Acme Corp",
      feedback:
        "Checkout abandonment is high because customers are forced to create a NovaCart account before payment. Their buyers say they just want to pay and leave.",
      productArea: "Checkout",
      priority: "High",
      date: "2026-08-04",
    }),
    feedbackToMemory({
      title: "Carts abandoned at the sign-up step",
      customer: "Brightline Outfitters",
      feedback:
        "Brightline reports roughly 40% of their NovaCart carts are abandoned at checkout. Their analytics show drop-off exactly at the mandatory account registration screen.",
      productArea: "Checkout",
      priority: "Critical",
      date: "2026-08-09",
    }),
    meetingToMemory({
      title: "Checkout friction review",
      date: "2026-08-12",
      participants: "Maya Chen (PM), Leo Park (Engineering Lead), Priya Das (Design), Sam Ortiz (Support)",
      productArea: "Checkout",
      notes:
        "Reviewed Acme Corp and Brightline Outfitters complaints about checkout abandonment. Support confirmed checkout friction is the top ticket theme this month. Agreed to investigate the account-creation step as the likely root cause.",
    }),
    {
      ...meetingToMemory({
        title: "PM analysis: account creation is the main checkout problem",
        date: "2026-08-14",
        participants: "Maya Chen (PM)",
        productArea: "Checkout",
        notes:
          "Maya Chen's funnel analysis identified mandatory account creation as the single largest cause of NovaCart checkout abandonment, linked directly to the Acme Corp and Brightline Outfitters feedback.",
      }),
    },
    meetingToMemory({
      title: "Engineering fraud risk briefing",
      date: "2026-08-18",
      participants: "Leo Park (Engineering Lead), Nadia Rahman (Security), Maya Chen (PM)",
      productArea: "Checkout",
      notes:
        "Engineering raised fraud concerns: without accounts, NovaCart loses identity signals used for fraud scoring. Current architecture has weak identity verification and no device fingerprinting, so removing accounts or adding one-click payment would increase chargeback risk.",
    }),
    meetingToMemory({
      title: "Guest checkout exploration",
      date: "2026-08-21",
      participants: "Maya Chen (PM), Priya Das (Design), Leo Park (Engineering Lead)",
      productArea: "Checkout",
      notes:
        "Team considered guest checkout as a way to remove forced account creation. Guest checkout could be protected with email verification and basic fraud rules, which Engineering believes is manageable in the current architecture.",
    }),
    meetingToMemory({
      title: "One-click checkout discussion",
      date: "2026-08-25",
      participants: "Maya Chen (PM), Leo Park (Engineering Lead), Nadia Rahman (Security)",
      productArea: "Checkout",
      notes:
        "Team discussed launching one-click checkout (saved payment, single tap purchase). Security warned that one-click requires strong identity and fraud controls that NovaCart does not have yet.",
    }),
    decisionToMemory({
      title: "Postpone one-click checkout",
      decision: "The team decided to postpone one-click checkout until identity and fraud controls are improved.",
      rationale:
        "The team considered the fraud risk too high for the current architecture. Identity verification and fraud scoring need more work before one-click payments can launch safely.",
      alternatives: "Ship one-click now with manual review; ship guest checkout first.",
      productArea: "Checkout",
      date: "2026-08-28",
      status: "Postponed",
    }),
    feedbackToMemory({
      title: "Asking for guest checkout",
      customer: "Lumen Home Goods",
      feedback:
        "Lumen Home Goods asked when NovaCart will offer guest checkout. Their shoppers leave when asked to register, and they mentioned competitors already let customers pay without an account.",
      productArea: "Checkout",
      priority: "High",
      date: "2026-09-02",
    }),
    competitorToMemory({
      competitor: "SwiftBasket",
      observation:
        "SwiftBasket launched a faster checkout with guest payment and one-tap Apple Pay, advertising 'checkout in 8 seconds'. Several NovaCart prospects cited it during sales calls.",
      productArea: "Checkout",
      date: "2026-09-05",
      source: "SwiftBasket launch blog and sales call notes",
    }),
    meetingToMemory({
      title: "Competitor pressure on checkout",
      date: "2026-09-08",
      participants: "Maya Chen (PM), Jordan Blake (Sales), Leo Park (Engineering Lead)",
      productArea: "Checkout",
      notes:
        "Sales reported SwiftBasket's faster checkout is creating competitive pressure and losing deals. The team revisited the postponed one-click decision and agreed guest checkout is the faster, safer response while fraud controls are built.",
    }),
    decisionToMemory({
      title: "Checkout improvement plan",
      decision:
        "Ship guest checkout with email verification in Q4, invest in identity and fraud controls (device fingerprinting, risk scoring), then revisit one-click checkout in Q1 2027.",
      rationale:
        "Guest checkout addresses the forced account creation complaints from Acme Corp, Brightline Outfitters and Lumen Home Goods, and responds to SwiftBasket, without taking on the fraud risk that postponed one-click checkout.",
      alternatives: "Launch one-click immediately; do nothing until fraud platform is complete.",
      productArea: "Checkout",
      date: "2026-09-12",
      status: "Approved",
    }),
  ];
  return drafts.map((d) => ({
    ...d,
    content: `[Fictional demo data — NovaCart]\n${d.content}`,
    metadata: { ...d.metadata, demo: "true" },
    tags: [...d.tags, "demo:novacart"],
  }));
}
