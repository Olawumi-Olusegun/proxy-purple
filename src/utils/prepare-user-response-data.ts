interface UserData {
  id?: string;
  _id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  addressLine1?: string;
  addressLine2?: string;
  postalCode?: string;
  role?: string;
  isVerified?: boolean;
}

interface UserResponse {
  success: boolean;
  message: string;
  user: UserData;
}

export function prepareUserResponseData(
  userData: UserData,
  message = "",
  success = true
): UserResponse {
  return {
    success,
    message,
    user: {
      id: userData.id,
      _id: userData._id,
      email: userData.email,
      firstName: userData.firstName ?? "",
      lastName: userData.lastName ?? "",
      phoneNumber: userData.phoneNumber ?? "",
      country: userData.country ?? "",
      city: userData.city ?? "",
      addressLine1: userData.addressLine1 ?? "",
      addressLine2: userData.addressLine2 ?? "",
      postalCode: userData.postalCode ?? "",
      role: userData.role,
      isVerified: userData.isVerified,
    },
  };
}
