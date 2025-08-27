"use client";
import { useCallback } from "react";
import httpClient from "@/lib/httpClient";
import useUser from "@/hooks/useUser";

export default function useCustomerData() {
  const { accessToken } = useUser();

  const processCustomerData = useCallback((customerData, searchContext) => {
    if (!customerData) return null;

    let accountNumbers = [];
    let cardNumbers = [];

    // Use customer accounts and cards from search context
    const customerAccounts = searchContext?.customerAccounts || [];
    const customerCards = searchContext?.customerCards || [];

    // Process account numbers
    if (searchContext?.searchType === "account" && searchContext?.searchedNumber) {
      accountNumbers = [searchContext.searchedNumber];
    } else if (customerAccounts.length > 0) {
      accountNumbers = [customerAccounts[0].account_number];
    }

    // Process card numbers
    if (customerData?.cardNumber) {
      cardNumbers = [customerData.cardNumber];
    } else if (searchContext?.searchType === "debit" || searchContext?.searchType === "credit") {
      cardNumbers = [searchContext.searchedNumber];
    } else if (customerCards && customerCards.length > 0) {
      cardNumbers = [customerCards[0].card_number];
    }

    // Map gender to correct format
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

  return { processCustomerData };
}