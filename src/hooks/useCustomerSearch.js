"use client";
import { useCallback } from "react";
import httpClient from "@/lib/httpClient";
import useUser from "@/hooks/useUser";

export default function useCustomerSearch() {
  const { accessToken } = useUser();

  const searchCustomer = useCallback(async (numberValue, sourceType) => {
    if (!accessToken || !numberValue.trim() || !sourceType) return null;

    try {
      let searchType = "";
      if (sourceType === "account") {
        searchType = "account";
      } else if (sourceType === "debit" || sourceType === "credit") {
        searchType = "card";
      }

      if (!searchType) return null;

      // Step 1: Search customer
      const { data: searchResult } = await httpClient.get('/v1/customers', {
        params: {
          search: numberValue.trim(),
          search_type: searchType,
          limit: 10
        },
        headers: { Authorization: accessToken }
      });

      const customers = searchResult?.data || searchResult || [];
      if (customers.length === 0) return null;

      const customer = customers[0];
      const customerId = customer.customer_id;

      // Step 2: Get customer accounts
      let customerAccounts = [];
      let related_account_id = null;
      
      try {
        const { data: accountsData } = await httpClient.get(`/v1/customers/${customerId}/accounts`, {
          headers: { Authorization: accessToken }
        });
        customerAccounts = Array.isArray(accountsData) ? accountsData : accountsData?.data || [];
        
        if (sourceType === "account") {
          const specificAccount = customerAccounts.find(acc => 
            acc.account_number?.toString() === numberValue.trim()
          );
          if (specificAccount) {
            related_account_id = specificAccount.account_id;
          }
        } else if (customerAccounts.length > 0) {
          related_account_id = customerAccounts[0].account_id;
        }
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
      }

      // Step 3: Get customer cards
      let customerCards = [];
      let related_card_id = null;
      
      try {
        const { data: cardsData } = await httpClient.get(`/v1/customers/${customerId}/cards`, {
          headers: { Authorization: accessToken }
        });
        customerCards = Array.isArray(cardsData) ? cardsData : cardsData?.data || [];
      } catch (error) {
        if (sourceType === "debit" || sourceType === "credit") {
          const mockCard = {
            card_id: `card_${customerId}_${numberValue.trim()}`,
            card_number: numberValue.trim(),
            card_type: sourceType === "credit" ? "KREDIT" : sourceType.toUpperCase(),
            account_id: related_account_id
          };
          customerCards = [mockCard];
          related_card_id = mockCard.card_id;
        }
      }

      return {
        customer: {
          ...customer,
          related_account_id,
          related_card_id,
          customerAccounts,
          customerCards,
          ...(sourceType === "account" ? {
            accountNumber: numberValue.trim(),
            cardNumber: customerCards.length > 0 ? customerCards[0].card_number : ""
          } : {}),
          ...(sourceType === "debit" || sourceType === "credit" ? {
            cardNumber: numberValue.trim(),
            accountNumber: customerAccounts.length > 0 ? customerAccounts[0].account_number : ""
          } : {})
        },
        searchContext: {
          searchedNumber: numberValue.trim(),
          searchType: sourceType,
          related_account_id,
          related_card_id,
          customerAccounts,
          customerCards
        }
      };
    } catch (error) {
      console.error("Customer search error:", error);
      throw error;
    }
  }, [accessToken]);

  const processCustomerData = useCallback((customerData, searchContext) => {
    if (!customerData) return null;

    let accountNumbers = [];
    let cardNumbers = [];

    const customerAccounts = searchContext?.customerAccounts || [];
    const customerCards = searchContext?.customerCards || [];

    if (searchContext?.searchType === "account" && searchContext?.searchedNumber) {
      accountNumbers = [searchContext.searchedNumber];
    } else if (customerAccounts.length > 0) {
      accountNumbers = [customerAccounts[0].account_number];
    }

    if (customerData?.cardNumber) {
      cardNumbers = [customerData.cardNumber];
    } else if (searchContext?.searchType === "debit" || searchContext?.searchType === "credit") {
      cardNumbers = [searchContext.searchedNumber];
    } else if (customerCards && customerCards.length > 0) {
      cardNumbers = [customerCards[0].card_number];
    }

    let genderValue = "";
    const rawGender = customerData.gender_type || customerData.gender || "";
    if (rawGender) {
      const upperGender = rawGender.toString().toUpperCase();
      if (upperGender === "MALE" || upperGender === "M" || upperGender === "L" || upperGender === "LAKI-LAKI") {
        genderValue = "MALE";
      } else if (upperGender === "FEMALE" || upperGender === "F" || upperGender === "P" || upperGender === "PEREMPUAN") {
        genderValue = "FEMALE";
      }
    }

    return {
      cif: customerData.cif || "",
      gender: genderValue,
      address: customerData.address || "",
      accountNumber: accountNumbers.join(", ") || "",
      placeOfBirth: customerData.place_of_birth || "",
      billingAddress: customerData.billing_address || "",
      cardNumber: cardNumbers.join(", ") || "",
      homePhone: customerData.home_phone || "",
      postalCode: customerData.postal_code || "",
      customerName: customerData.full_name || "",
      handphone: customerData.phone_number || "",
      officePhone: customerData.office_phone || "",
      personId: customerData.nik || "",
      email: customerData.email || "",
      faxPhone: customerData.fax_phone || "",
    };
  }, []);

  return { searchCustomer, processCustomerData };
}