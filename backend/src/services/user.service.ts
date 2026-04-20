import { AppError } from "../middlewares/errorHandler.js";
import type { UpdateProfileInput } from "../dtos/profile.dto.js";
import { userRepository } from "../repositories/user.repository.js";

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    const { passwordHash: _, ...rest } = user;
    return rest;
  },

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    const updated = await userRepository.update(userId, {
      name: input.name ?? user.name,
    });
    const { passwordHash: _, ...rest } = updated;
    return rest;
  },

  async setAvatarUrl(userId: string, publicPath: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found");
    }
    const updated = await userRepository.update(userId, { avatarUrl: publicPath });
    const { passwordHash: _, ...rest } = updated;
    return rest;
  },
};
