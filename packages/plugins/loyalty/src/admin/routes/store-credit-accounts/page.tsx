import { defineRouteConfig } from "@nedusa/admin-sdk"
import { LayoutComposer } from "@nedusa/dashboard/components"
import { Toaster } from "@nedusa/ui"
import StoreCreditIcon from "../../components/icons/store-credit-icon"
import { StoreCreditAccountsTable } from "./components/store-credit-accounts-table/table"

const StoreCreditAccountsPage = () => {
  return (
    <>
      <LayoutComposer
        widgetsZonePrefix="store_credit_account.list"
        preferredLayoutId="core:single-column"
        sections={{
          main: (
            <LayoutComposer.Entry id="StoreCreditAccountsTable">
              <StoreCreditAccountsTable />
            </LayoutComposer.Entry>
          ),
        }}
      />

      <Toaster />
    </>
  )
}

export const config = defineRouteConfig({
  label: "Store Credits",
  icon: StoreCreditIcon,
})

export default StoreCreditAccountsPage
