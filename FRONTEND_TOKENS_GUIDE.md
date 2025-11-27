# Frontend Implementation Guide - Tokens Module

## Overview
This guide provides comprehensive documentation for frontend developers to integrate with the Tokens API endpoints. The tokens system is used for purchasing services within the platform.

## Authentication
All endpoints require JWT Bearer authentication. Include the token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## API Endpoints

### 1. Get Token Balance (MOST IMPORTANT - Call frequently)
**Endpoint:** `GET /tokens/balance`

**Description:** Retrieves the current user's token balance. This should be called:
- On app/page load
- After any purchase
- After any token-consuming action
- Periodically to keep balance updated

**Response - TokenBalanceDto:**
```typescript
{
  balance: number;           // Current available tokens
  totalPurchased: number;    // Total tokens ever purchased
  totalConsumed: number;     // Total tokens ever consumed
  totalGranted: number;      // Total tokens received as bonus/promotions
  lastPurchaseAt?: Date;     // Last purchase timestamp (optional)
}
```

**Example Request:**
```javascript
const response = await fetch('https://api.inker.com/tokens/balance', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  }
});

const balance = await response.json();
console.log(`Current balance: ${balance.balance} tokens`);
```

### 2. Get Available Token Packages
**Endpoint:** `GET /tokens/packages`

**Description:** Retrieves all available token packages for purchase.

**Response - Array of TokenPackageDto:**
```typescript
[
  {
    id: string;              // Package identifier (use for purchase)
    name: string;            // Display name (e.g., "Basic Pack")
    tokens: number;          // Number of tokens in package
    price: number;           // Price in USD
    currency: string;        // Currency code (e.g., "USD")
    pricePerToken: number;   // Calculated price per token
    savings: number;         // Savings percentage vs base price
    description: string;     // Package description
    badge?: string;          // Optional badge (e.g., "BEST VALUE")
  }
]
```

**Example Request:**
```javascript
const response = await fetch('https://api.inker.com/tokens/packages', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  }
});

const packages = await response.json();
// Display packages to user for selection
```

### 3. Purchase Tokens
**Endpoint:** `POST /tokens/purchase`

**Description:** Purchase a token package.

**Request Body - PurchaseTokensDto:**
```typescript
{
  packageId: string;         // ID from the packages endpoint
  paymentData: {            // Payment gateway data
    paymentMethodId: string; // Payment method identifier
    returnUrl: string;       // URL to redirect after payment
    // Additional fields may be required by payment gateway
  }
}
```

**Response - TokenBalanceDto:**
Returns the updated balance after successful purchase (same structure as balance endpoint).

**Status Codes:**
- 200: Purchase successful
- 400: Invalid package or payment data
- 402: Payment failed

**Example Request:**
```javascript
const purchaseData = {
  packageId: "package-100-tokens",
  paymentData: {
    paymentMethodId: "pm_1234567890",
    returnUrl: "https://app.inker.com/tokens/success"
  }
};

const response = await fetch('https://api.inker.com/tokens/purchase', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <jwt-token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(purchaseData)
});

if (response.ok) {
  const updatedBalance = await response.json();
  // Update UI with new balance
} else if (response.status === 402) {
  // Handle payment failure
}
```

### 4. Get Transaction History
**Endpoint:** `GET /tokens/transactions`

**Description:** Retrieves paginated token transaction history.

**Query Parameters:**
- `limit`: Number of records to return (default: 20)
- `offset`: Number of records to skip (default: 0)
- `type`: Filter by transaction type (optional)

**Response - Array of TokenTransactionDto:**
```typescript
[
  {
    id: string;                    // Transaction ID
    type: string;                  // Transaction type (enum)
    amount: number;                // Amount (positive=income, negative=expense)
    balanceBefore: number;         // Balance before transaction
    balanceAfter: number;          // Balance after transaction
    status: string;                // Transaction status (enum)
    metadata?: Record<string, any>; // Additional transaction data
    createdAt: Date;               // Transaction timestamp
  }
]
```

**Transaction Types:**
- `PURCHASE`: Token purchase
- `CONSUMPTION`: Token usage
- `GRANT`: Promotional/bonus tokens
- `REFUND`: Refunded tokens

**Transaction Status:**
- `PENDING`: Transaction processing
- `COMPLETED`: Transaction successful
- `FAILED`: Transaction failed
- `REFUNDED`: Transaction refunded

**Example Request:**
```javascript
// Get first 10 transactions
const response = await fetch('https://api.inker.com/tokens/transactions?limit=10&offset=0', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <jwt-token>'
  }
});

const transactions = await response.json();
// Display transaction history
```

## Implementation Best Practices

### 1. Balance Management
```javascript
// Create a balance manager service
class TokenBalanceService {
  private balance: number = 0;
  private lastFetch: Date | null = null;
  
  async fetchBalance() {
    const response = await fetch('/tokens/balance', {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      this.balance = data.balance;
      this.lastFetch = new Date();
      this.notifyListeners();
    }
    
    return this.balance;
  }
  
  // Refresh balance every 30 seconds or after actions
  startPolling() {
    setInterval(() => this.fetchBalance(), 30000);
  }
  
  // Call after any token-consuming action
  async refreshAfterAction() {
    return this.fetchBalance();
  }
}
```

### 2. Purchase Flow
```javascript
async function purchaseTokens(packageId: string) {
  try {
    // 1. Show loading state
    showPurchaseLoading();
    
    // 2. Prepare payment data
    const paymentData = await preparePayment();
    
    // 3. Make purchase request
    const response = await fetch('/tokens/purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        packageId,
        paymentData
      })
    });
    
    // 4. Handle response
    if (response.ok) {
      const updatedBalance = await response.json();
      updateUIBalance(updatedBalance.balance);
      showSuccessMessage('Tokens purchased successfully!');
    } else {
      const error = await response.json();
      showErrorMessage(error.message);
    }
  } catch (error) {
    showErrorMessage('Purchase failed. Please try again.');
  } finally {
    hidePurchaseLoading();
  }
}
```

### 3. Error Handling
```javascript
class TokensAPI {
  async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`/tokens${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // Redirect to login
          redirectToLogin();
          return;
        }
        
        if (response.status === 402) {
          throw new Error('Payment required');
        }
        
        const error = await response.json();
        throw new Error(error.message || 'Request failed');
      }
      
      return response.json();
    } catch (error) {
      console.error('Tokens API Error:', error);
      throw error;
    }
  }
}
```

### 4. UI Components Example
```jsx
// Balance Display Component
function TokenBalance() {
  const [balance, setBalance] = useState(null);
  
  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, []);
  
  async function fetchBalance() {
    const data = await tokensAPI.request('/balance');
    setBalance(data);
  }
  
  if (!balance) return <Spinner />;
  
  return (
    <div className="token-balance">
      <h3>Your Balance</h3>
      <div className="balance-amount">{balance.balance} tokens</div>
      <div className="balance-stats">
        <span>Purchased: {balance.totalPurchased}</span>
        <span>Used: {balance.totalConsumed}</span>
      </div>
    </div>
  );
}

// Package Selection Component
function TokenPackages() {
  const [packages, setPackages] = useState([]);
  
  useEffect(() => {
    async function loadPackages() {
      const data = await tokensAPI.request('/packages');
      setPackages(data);
    }
    loadPackages();
  }, []);
  
  return (
    <div className="token-packages">
      {packages.map(pkg => (
        <div key={pkg.id} className="package-card">
          {pkg.badge && <span className="badge">{pkg.badge}</span>}
          <h4>{pkg.name}</h4>
          <p>{pkg.tokens} tokens</p>
          <p>${pkg.price} {pkg.currency}</p>
          <p>Save {pkg.savings}%</p>
          <button onClick={() => purchaseTokens(pkg.id)}>
            Purchase
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Important Notes

1. **Always check balance before token-consuming actions** to ensure user has sufficient tokens
2. **Refresh balance after any transaction** to keep UI in sync
3. **Handle payment failures gracefully** with clear error messages
4. **Cache balance locally** but refresh frequently
5. **Show loading states** during purchase operations
6. **Validate package selection** before initiating purchase

## Testing in Development

Use these test scenarios:
1. Check balance on login
2. Purchase different package sizes
3. Handle insufficient balance scenarios
4. Test payment failures
5. Verify transaction history pagination
6. Test concurrent balance updates