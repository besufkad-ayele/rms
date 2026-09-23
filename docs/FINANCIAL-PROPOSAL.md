# Restaurant Management System (RMS)
## Software Implementation — Financial Proposal

| | |
|:---|:---|
| **Prepared for** | `[Client / Café / Restaurant Name]` |
| **Prepared by** | `[Your Name / Company]` |
| **Date** | 21 September 2026 |
| **Valid until** | 6 October 2026 (15 days) |
| **Document** | Confidential — software implementation only |

---

## 1. Project Overview & Scope

**Objective:** Implement and deploy the **RMS (Restaurant Management System)** software so the café/restaurant can run day-to-day operations digitally — orders, kitchen, inventory, staff, payments verification, and basic financial visibility — **without hardware procurement or fiscal-machine integration**.

This is a **software-only** engagement. Total professional fee: **ETB 120,000.00** (one hundred twenty thousand Ethiopian Birr). No cash registers, printers, networking, servers, or ERCA fiscal devices are included or required to be purchased through us.

### Implementation scope

| Area | What is included | What it means in practice |
|:---|:---|:---|
| **Sales & POS (software)** | Counter/floor order flow, product catalog, categories, pricing, bill/receipt generation, kitchen tickets | Staff take or confirm orders in the app; system prints/shows **standard** receipts and kitchen slips (USB/network printer if *you* already have one). **Not** ERCA/Ministry of Revenues fiscal cash-register integration. |
| **Operations & supply** | Ingredient stock, recipe (BOM) links, low-stock alerts, basic purchase/receive logging | Stock levels update when items are sold; managers see what is running low. |
| **Staff & shifts** | Profiles, roles, PIN login, shift roster, clock-in/out | Who is on duty, who can open which screen, attendance without paper sheets. |
| **Payments (manual rails)** | Cash, CBE transfer, Telebirr/Telegram — **verification workflow** | Cashier marks payment after checking slip/cash. **No** bank API / payment-gateway / POS terminal integration. |
| **Finance & admin** | Daily sales views, COGS/basic P&L summaries, user access rights, initial data load, basic dashboards | Owner sees sales and costs inside RMS — **not** external tax filing or fiscal reporting. |
| **Delivery & onboarding** | Training, UAT, go-live, handover notes | Staff can operate the system independently after Day 7. |

### Clarification — POS session open/close

A **POS session** is the software bookend of a cashier shift:

1. **Open:** Record starting cash float → unlock taking orders for that shift.  
2. **During:** Sales accumulate; optional cash-in / cash-out (petty cash) notes.  
3. **Close:** Count drawer → system compares expected vs counted cash → records variance → locks the session.

This is **operational cash control inside the software**, not a legal fiscal seal and not a hardware cash drawer driver package.

### Clarification — “POS integration”

| Included | Not included |
|:---|:---|
| Software POS / order & billing screens | Fiscal printer / ERCA legal cash machine |
| Standard receipt / kitchen ticket output (if client printer already works on the network) | Buying or installing printers, tablets, routers |
| Manual confirmation of CBE / Telebirr / cash | Live bank or Telebirr API payment gateway |
| Role-based access (cashier vs manager) | Third-party Odoo or other license fees |

---

## 2. Implementation Timeline (7 Days)

| Phase | When | Activities |
|:---|:---|:---|
| **Phase 1** | Day 1 | Kick-off, confirm menu/floor/staff needs, access & roles |
| **Phase 2** | Days 2–3 | Configure modules: POS/orders, inventory/recipes, staff, payments workflow, dashboards |
| **Phase 3** | Day 4 | Data entry (menu, prices, stock opening balances, tables/QR), system testing |
| **Phase 4** | Day 5 | End-user training + User Acceptance Testing (UAT) |
| **Phase 5** | Day 6 | Go-live, final operational tweaks |
| **Phase 6** | Day 7 | Handover documentation & project close |

---

## 3. Team & Effort (How the Fee Is Built)

Software delivery is priced from the people who implement it — **not** from hardware or third-party licenses.

| Role | People | Responsibility | Allocated fee (ETB) |
|:---|:---:|:---|---:|
| **Software developer** | 2 | Configure RMS modules, workflows, roles, reports, go-live fixes | **70,000** |
| **QA / tester** | 1 | Test order → kitchen → pay → stock → reports; UAT support | **20,000** |
| **Data entry & setup** | 1 | Menu, categories, prices, ingredients, recipes, tables/QR, opening stock, users | **20,000** |
| **Training, go-live & handover** | (shared above) | On-site/remote training, Day 6–7 support, handover pack | **10,000** |
| | | **Total software implementation** | **120,000** |

*Rates are blended into a fixed project price. Scope changes after kick-off are quoted separately.*

---

## 4. Post-Implementation Support & Exclusions

### Free support (1 month after go-live)

Included at no extra charge for **30 days** from go-live:

- User assistance and process clarification  
- Minor configuration adjustments inside agreed scope  
- Bug troubleshooting and small corrections  
- Guidance on daily open/close, stock, and reports  

### Out of scope (separate commercial agreement if needed)

- Cabling, networking, Wi-Fi, server/hosting infrastructure and hosting invoices  
- Payment gateway / bank API / Telebirr API integrations  
- Cash register **hardware**, tablets, printers, scanners — procurement or physical install  
- **Fiscal / ERCA / Ministry of Revenues** cash-register or legal tax-printer integration  
- Major custom development beyond the modules listed in Section 1  
- Third-party software licenses (e.g. Odoo Enterprise subscriptions) — **not applicable**; client receives RMS software use under this project  
- Ongoing retainer after the free month (optional; quoted on request)

**Client provides:** working internet, devices for staff/guests, and any printers they already own. Domain/cloud usage (if any) is paid directly by the client to the provider.

---

## 5. Financial Terms & Payment Milestones

**Total project fee: ETB 120,000.00**  
*(Three Hundred Fifty Thousand competitors’ typical café Odoo deploy — this proposal is software-only RMS at about one-third that level.)*

| Milestone | Share | Amount (ETB) | Trigger |
|:---|:---:|---:|:---|
| **Advance** | 40% | **48,000** | Project commencement / engagement confirmation |
| **Go-live** | 40% | **48,000** | Setup, UAT, and go-live complete |
| **Final** | 20% | **24,000** | End of 1-month free support period |

Currency: Ethiopian Birr (ETB). VAT applies per Ethiopian tax rules if required.

---

## 6. Feature Detail (What Each Line Means)

### 6.1 Sales & software POS
- Floor/counter order taking and bill settlement in the app  
- Product catalog + categories (e.g. Hot Drinks, Mains, Juices)  
- Session **open/close** and cash float / variance note (see Section 1)  
- Receipts and kitchen tickets as **standard print/PDF/screen** — not fiscal seals  

### 6.2 Inventory & recipes
- Ingredients in g / ml / piece  
- Recipe BOM so selling a dish deducts ingredients  
- Low-stock visibility; opening balances loaded during Day 4  

### 6.3 Staff & access
- Staff profiles, roles (cashier, waiter, kitchen, manager)  
- PIN / portal login; who may adjust stock or see finance  

### 6.4 Payments (manual)
- Record method: cash / CBE / Telebirr  
- Staff confirm after verifying slip or cash — **no live gateway**  

### 6.5 Finance dashboards
- Daily sales, basic cost/profit views, simple item performance  
- Access rights so cashiers do not edit back-office settings  

### 6.6 Training & handover
- Hands-on training for operators and one manager brief  
- Short handover note: how to open/close day, add menu items, adjust stock  

---

## 7. Legal & Commercial Terms

1. **Validity:** 15 days from the date on this proposal.  
2. **Nature of work:** Fixed-fee **software implementation & configuration** of RMS as described; not a hardware sale.  
3. **Ownership / use:** Upon final payment, client retains operational use of the configured RMS instance for their business; further custom modules are out of scope unless agreed in writing.  
4. **Changes:** Work outside Section 1 requires a written change order and new fee.  
5. **Acceptance:** Signing below confirms agreement to scope, timeline, fee, and milestones.

| | Client | Service provider |
|:---|:---|:---|
| **Name** | | |
| **Title** | | |
| **Signature** | | |
| **Date** | | |

---

## 8. Why This Proposal vs. Typical Odoo Café Deploys

| | Typical Odoo café proposal (example) | This RMS proposal |
|:---|:---|:---|
| Total fee | ~ETB 350,000 | **ETB 120,000** |
| Focus | Configure Odoo modules | Configure **purpose-built RMS** (QR, local rails, recipes, staff) |
| Hardware / fiscal | Usually excluded | **Excluded** (same clarity) |
| Payment APIs | Usually excluded | **Excluded** |
| Free support | ~1 month | **1 month** |
| Timeline | ~7 days | **7 days** |
| Cost transparency | Often lump sum | **2 developers + 1 tester + data entry** broken out |

---

*Software cost only. Maximum professional fee under this proposal: **ETB 120,000**. Hardware, hosting invoices, fiscal machines, and payment gateways are never included.*
