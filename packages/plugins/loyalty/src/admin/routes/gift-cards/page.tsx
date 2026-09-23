import { defineRouteConfig } from "@nedusa/admin-sdk"
import { LayoutComposer } from "@nedusa/dashboard/components"
import { Toaster } from "@nedusa/ui"
import GiftCardIcon from "../../components/icons/gift-card-icon"
import GiftCardProductsSection from "./components/gift-card-products-section"
import { GiftCardsTable } from "./components/gift-cards-table/gift-cards-table"

const GiftCardsPage = () => {
  return (
    <>
      <LayoutComposer
        widgetsZonePrefix="gift_card.list"
        preferredLayoutId="core:two-column"
        sections={{
          main: (
            <LayoutComposer.Entry id="GiftCardsTable">
              <GiftCardsTable />
            </LayoutComposer.Entry>
          ),
          side: (
            <LayoutComposer.Entry id="GiftCardProductsSection">
              <GiftCardProductsSection />
            </LayoutComposer.Entry>
          ),
        }}
      />

      <Toaster />
    </>
  )
}

export const config = defineRouteConfig({
  label: "Gift Cards",
  icon: GiftCardIcon,
})

export default GiftCardsPage
