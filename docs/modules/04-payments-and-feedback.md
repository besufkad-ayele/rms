# Module 04: Payments & Customer Feedback Engine

## 1. Overview & Operational Goals
The Payments & Customer Feedback module manages multi-channel settlements (especially popular regional transfer methods like Commercial Bank of Ethiopia (CBE), Telegram / Telebirr, and cash) and captures internal and external reputation metrics from every single dining experience.

### Key Capabilities:
1. **Multi-Rail Payment Gateway**:
   - **CBE Transfer**: Account number display, transaction code entry, receipt screenshot upload.
   - **Telegram / Telebirr**: Fast digital payment link integration.
   - **Cash**: Handled directly with table attendant verification.
2. **Staff Verification Workflow**: For cash and offline transfers, on-duty attendants or cashiers verify and confirm receipt before clearing the table.
3. **Multi-Factor Weighted Feedback**: Granular 1-5 star ratings evaluating specific waiter performance alongside food taste, service speed, and restaurant ambience.
4. **Google Business Review Redirection Funnel**: Automated algorithm that routes highly satisfied diners ($\ge 4.0/5.0$) directly to Google Business Reviews, while routing low-score complaints internally to management for immediate resolution.

---

## 2. Payment Flow & Settlement Workflow

```mermaid
graph TD
    SelectPayment([Customer selects payment method]) --> ChooseMethod{Payment Method}

    ChooseMethod -->|CBE Transfer| ShowCBE[Show Restaurant CBE Account & QR]
    ShowCBE --> InputCBERef[Customer enters TX Code & uploads receipt]
    InputCBERef --> PendingVerification[Payment Status: 'pending']

    ChooseMethod -->|Telegram / Telebirr| ShowTelebirr[Show Telegram bot / Telebirr link]
    ShowTelebirr --> InputTelebirrRef[Customer submits confirmation code]
    InputTelebirrRef --> PendingVerification

    ChooseMethod -->|Cash| CashWait[Waiter arrives at table with bill]
    CashWait --> StaffConfirm[Staff confirms receipt in staff portal]

    PendingVerification --> StaffConfirm
    StaffConfirm --> MarkPaid[Payment Status: 'confirmed' & Order: 'paid']
    MarkPaid --> FreeTable[Set Table Status: 'free']
    FreeTable --> RouteFeedback[Trigger /order/[tableCode]/feedback]
```

---

## 3. Weighted Customer Feedback Engine

Immediately following payment confirmation, customers are presented with a streamlined 30-second rating form:

### 3.1 Scoring Dimensions & Weights

| Dimension | Field Name | Weight | Question Text |
|---|---|---|---|
| **Attendant Friendliness** | `staff_rating_q1` | **25%** | How courteous and welcoming was your server? |
| **Attendant Accuracy** | `staff_rating_q2` | **25%** | Was your order taken and served accurately? |
| **Food Quality & Taste** | `experience_rating_food` | **20%** | How delicious and well-prepared was your meal? |
| **Kitchen Delivery Speed**| `experience_rating_speed`| **15%** | How fast did your food arrive after ordering? |
| **Ambience & Cleanliness**| `experience_rating_ambience`| **15%** | How was the atmosphere, music, and cleanliness? |

### 3.2 Composite Weighted Score Formula

$$\text{Weighted Score} = (Q_1 \times 0.25) + (Q_2 \times 0.25) + (\text{Food} \times 0.20) + (\text{Speed} \times 0.15) + (\text{Ambience} \times 0.15)$$

---

## 4. Google Business Review Redirection Funnel

```mermaid
graph LR
    SubmitFeedback[Customer Submits Rating Form] --> ComputeScore{Weighted Score >= 4.0?}
    ComputeScore -->|Yes (High Satisfaction)| RouteGoogle[Redirect to Google Business Review URL]
    ComputeScore -->|No (Constructive Feedback)| InternalAlert[Send Private Alert to Manager Dashboard]
    
    RouteGoogle --> GooglePublic([Public 5-Star Google Reviews Increase])
    InternalAlert --> ManagerResolution([Manager Contacts Guest / Resolves Issue Internally])
```

1. **High Ratings ($\ge 4.0$)**: The customer is greeted with a thank-you prompt and a 1-click button opening the restaurant's public Google Business Review page with pre-filled 5-star intent.
2. **Lower Ratings ($< 4.0$)**: The customer's detailed private feedback is flagged on the Admin `/admin/reviews` dashboard for manager review, preventing public negative reviews while identifying operational bottlenecks.
