import { createFileRoute } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Fragment } from "react";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/accounts")({
  component: AccountsPage,
});

// Mock data for accounts
type Account = {
  id: string;
  name: string;
  balance: string;
  currency: string;
  iconColor: string;
  icon: typeof PlusSignIcon;
};

const accounts: Account[] = [
  {
    id: "1",
    name: "Донги",
    balance: "3.23M",
    currency: "₫",
    iconColor: "#00a0df",
    icon: PlusSignIcon,
  },
  {
    id: "2",
    name: "Binance",
    balance: "702",
    currency: "¥",
    iconColor: "#f3ba2f",
    icon: PlusSignIcon,
  },
  {
    id: "3",
    name: "BYBIT",
    balance: "1,522",
    currency: "¥",
    iconColor: "#f3ba2f",
    icon: PlusSignIcon,
  },
  {
    id: "4",
    name: "BingX",
    balance: "826",
    currency: "¥",
    iconColor: "#0066ff",
    icon: PlusSignIcon,
  },
  {
    id: "5",
    name: "Bitget",
    balance: "947",
    currency: "¥",
    iconColor: "#00a0df",
    icon: PlusSignIcon,
  },
  {
    id: "6",
    name: "TG Wallet",
    balance: "212",
    currency: "¥",
    iconColor: "#00a0df",
    icon: PlusSignIcon,
  },
  {
    id: "7",
    name: "Тинькофф",
    balance: "0",
    currency: "₽",
    iconColor: "#ffdd2d",
    icon: PlusSignIcon,
  },
  {
    id: "8",
    name: "Инвесткопилка",
    balance: "84,070",
    currency: "₽",
    iconColor: "#9c27b0",
    icon: PlusSignIcon,
  },
  {
    id: "9",
    name: "BTC",
    balance: "0.000",
    currency: "₽",
    iconColor: "#f7931a",
    icon: PlusSignIcon,
  },
];

function AccountsPage() {
  const total = "$6,944";

  return (
    <div className="flex-1 p-4">
      <div className="mb-6">
        <div className="text-sm mb-2">Total:</div>
        <div className="text-4xl font-bold">{total}</div>
      </div>

      <Card size="sm" className="py-1!">
        <ItemGroup>
          {accounts.map((account, index) => (
            <Fragment key={account.id}>
              <Item size="sm">
                <ItemMedia
                  variant="icon"
                  style={{ backgroundColor: account.iconColor }}
                >
                  <HugeiconsIcon icon={account.icon} className="size-5" />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{account.name}</ItemTitle>
                </ItemContent>
                <ItemActions>
                  <span className="font-medium">
                    {account.currency}
                    {account.balance}
                  </span>
                </ItemActions>
              </Item>
              {index !== accounts.length - 1 && <ItemSeparator />}
            </Fragment>
          ))}
        </ItemGroup>
      </Card>
    </div>
  );
}
