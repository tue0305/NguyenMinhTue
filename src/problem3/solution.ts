/**
 * Problem 3: Messy React
 * 
 * This file contains the analysis of inefficiencies and anti-patterns
 * in the provided code, along with a refactored solution.
 */

// --------------------------------
// ANALYSIS OF ISSUES IN ORIGINAL CODE
// --------------------------------

/**
 * Issues in the original code:
 * 
 * 1. Type Safety Issues:
 *    - `blockchain` parameter in `getPriority` is typed as `any` instead of a specific type
 *    - `WalletBalance` interface is missing the `blockchain` property that's used in the code
 *    - Variable `lhsPriority` is undefined but used in the filter condition
 *    - Incorrect type assertion in the second map function (using FormattedWalletBalance for sortedBalances)
 *    - `BoxProps` is used but not imported or defined
 *    - `classes.row` is used but `classes` is not defined
 * 
 * 2. Logic Issues:
 *    - Filter logic is incorrect and will always return false (due to broken conditions)
 *    - The logic intends to filter balances with priority > -99 and amount > 0, but does the opposite
 *    - Sort function doesn't handle the case when priorities are equal
 *    - Destructuring `children` from props but not using it
 * 
 * 3. Performance Issues:
 *    - `useMemo` dependency array includes `prices` but the function doesn't use it
 *    - `getPriority` function is recreated on every render
 *    - Multiple unnecessary mappings of the data
 *    - `formattedBalances` array is created but never used
 *    - Using array index as React key which can cause issues with list rendering
 * 
 * 4. Code Style & Structure:
 *    - Inconsistent indentation in the code
 *    - Missing return type for the `sortedBalances` useMemo
 *    - Not using TypeScript enums for blockchains
 */

// --------------------------------
// REFACTORED SOLUTION
// --------------------------------

import React, { useMemo } from 'react';

// Define proper types for better type safety
interface BoxProps {
  className?: string;
  children?: React.ReactNode;
}

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain; // Added missing property
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Use enum for blockchain types to improve type safety
enum Blockchain {
  Osmosis = 'Osmosis',
  Ethereum = 'Ethereum',
  Arbitrum = 'Arbitrum',
  Zilliqa = 'Zilliqa',
  Neo = 'Neo'
}

// Props for the WalletRow component
interface WalletRowProps {
  className?: string;
  amount: number;
  usdValue: number;
  formattedAmount: string;
}

// Move utility functions outside component to prevent recreation on each render
const getPriority = (blockchain: Blockchain): number => {
  switch (blockchain) {
    case Blockchain.Osmosis:
      return 100;
    case Blockchain.Ethereum:
      return 50;
    case Blockchain.Arbitrum:
      return 30;
    case Blockchain.Zilliqa:
    case Blockchain.Neo:
      return 20;
    default:
      return -99;
  }
};

// WalletRow component
const WalletRow: React.FC<WalletRowProps> = ({
  className,
  amount,
  usdValue,
  formattedAmount
}) => {
  return (
    <div className={className}>
      <div>{formattedAmount}</div>
      <div>${usdValue.toFixed(2)}</div>
    </div>
  );
};

// Custom hooks (mocked for demonstration)
const useWalletBalances = (): WalletBalance[] => {
  // This would normally fetch from a data source
  return [];
};

const usePrices = (): Record<string, number> => {
  // This would normally fetch prices from an API
  return {};
};

// Main component
const WalletPage: React.FC<BoxProps> = ({ className, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // Memoize filtered and sorted balances
  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        // Filter for balances with valid priority and positive amount
        const balancePriority = getPriority(balance.blockchain);
        return balancePriority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        // Sort by priority in descending order
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        return rightPriority - leftPriority; // Simplified comparison
      });
  }, [balances]); // Removed prices from dependency as it's not used

  // Memoize formatted balances to prevent unnecessary recalculations
  const formattedBalances = useMemo(() => {
    return sortedBalances.map((balance: WalletBalance): FormattedWalletBalance => {
      return {
        ...balance,
        formatted: balance.amount.toFixed(2) // Added decimal places for better formatting
      };
    });
  }, [sortedBalances]);

  // Memoize row components to prevent unnecessary re-renders
  const rows = useMemo(() => {
    return formattedBalances.map((balance: FormattedWalletBalance) => {
      const usdValue = prices[balance.currency] * balance.amount;
      return (
        <WalletRow 
          className={className}
          key={`${balance.blockchain}-${balance.currency}`} // Better key for stability
          amount={balance.amount}
          usdValue={usdValue}
          formattedAmount={balance.formatted}
        />
      );
    });
  }, [formattedBalances, prices, className]);

  return (
    <div {...rest}>
      {rows}
    </div>
  );
};

export default WalletPage;