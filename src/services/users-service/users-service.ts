import { FilterQuery, SortOrder } from "mongoose";
import { HttpError } from "../../utils/http-error";
import { User } from "../../models/user.model";
import { IUser } from "../../types/type";

interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isVerified?: boolean;
  country?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

type UserDocument = IUser;

interface PaginatedUsersResponse {
  data: {
    users: UserDocument[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      limit: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export class UsersService {
  async getUsers(query: GetUsersQuery = {}): Promise<PaginatedUsersResponse> {
    try {
      // Default values
      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build filter object with proper typing
      const filter: FilterQuery<IUser> = {};

      // Search by email, firstName, or lastName
      if (query.search) {
        filter.$or = [
          { email: { $regex: query.search, $options: "i" } },
          { firstName: { $regex: query.search, $options: "i" } },
          { lastName: { $regex: query.search, $options: "i" } },
        ];
      }

      // Filter by role
      if (query.role) {
        filter.role = query.role;
      }

      // Filter by verification status
      // Filter by verification status
      if (query.isVerified !== undefined) {
        const isVerified =
          typeof query.isVerified === "string"
            ? query.isVerified === "true"
            : query.isVerified;
        filter.isVerified = isVerified;
      }

      // Filter by country
      if (query.country) {
        filter.country = query.country;
      }

      // Building sort object
      const sort: Record<string, SortOrder> = {};
      if (query.sortBy) {
        sort[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;
      } else {
        sort.createdAt = -1; // Default: newest first
      }

      // Execute queries in parallel
      const [users, totalUsers] = await Promise.all([
        User.find(filter)
          .select("-password") // Exclude password field
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean() as Promise<UserDocument[]>,
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalUsers / limit);

      return {
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch {
      throw new HttpError("Failed to fetch users", 500);
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await User.findById(userId).select("-password");

      if (!user) {
        throw new HttpError("User not found", 404);
      }

      return user;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      throw new HttpError("Failed to fetch user", 500);
    }
  }

  async deleteUser(userId: string) {
    if (!userId) {
      throw new HttpError("Invalid user ID", 400);
    }

    try {
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        throw new HttpError("User not found", 404);
      }

      return deletedUser;
    } catch {
      throw new HttpError("Failed to delete user", 500);
    }
  }
}
