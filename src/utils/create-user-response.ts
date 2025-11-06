interface UserResponse {
  success: boolean;
  message?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    country: string;
    city: string;
    addressLine1: string;
    addressLine2: string;
    postalCode: string;
    role?: string;
    isVerified?: boolean;
  };
}

export const createUserResponse = (
  user: UserResponse["user"],
  message?: string
): UserResponse => {
  return {
    success: true,
    message: message ?? "",
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      country: user.country ?? "",
      city: user.city ?? "",
      addressLine1: user.addressLine1 ?? "",
      addressLine2: user.addressLine2 ?? "",
      postalCode: user.postalCode ?? "",
      role: user.role,
      isVerified: user.isVerified,
    },
  };
};
