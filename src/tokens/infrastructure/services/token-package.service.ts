import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenPackage, TOKEN_PACKAGES } from '../../domain/constants/token-packages';
import { UpdateTokenPackageDto } from '../../domain/dtos/update-package.dto';

@Injectable()
export class TokenPackageService {
  private packages: Map<string, TokenPackage & { isActive: boolean }>;

  constructor(private readonly configService: ConfigService) {
    // Initialize with default packages
    this.packages = new Map();
    TOKEN_PACKAGES.forEach(pkg => {
      this.packages.set(pkg.id, { ...pkg, isActive: true });
    });
  }

  getAllPackages(includeInactive = false): TokenPackage[] {
    const packages = Array.from(this.packages.values());
    if (includeInactive) {
      return packages;
    }
    return packages.filter(pkg => pkg.isActive);
  }

  getPackageById(id: string): TokenPackage | null {
    const pkg = this.packages.get(id);
    return pkg && pkg.isActive ? pkg : null;
  }

  updatePackage(id: string, updates: UpdateTokenPackageDto): TokenPackage | null {
    const pkg = this.packages.get(id);
    if (!pkg) {
      return null;
    }

    // Update package properties
    if (updates.name !== undefined) pkg.name = updates.name;
    if (updates.tokens !== undefined) {
      pkg.tokens = updates.tokens;
      // Recalculate price per token
      pkg.pricePerToken = pkg.price / pkg.tokens;
    }
    if (updates.price !== undefined) {
      pkg.price = updates.price;
      // Recalculate price per token and savings
      pkg.pricePerToken = pkg.price / pkg.tokens;
      const basePrice = 0.50; // Base price from starter package
      pkg.savings = Math.round((1 - (pkg.pricePerToken / basePrice)) * 100);
    }
    if (updates.description !== undefined) pkg.description = updates.description;
    if (updates.badge !== undefined) pkg.badge = updates.badge;
    if (updates.isActive !== undefined) pkg.isActive = updates.isActive;

    this.packages.set(id, pkg);
    return pkg;
  }

  createPackage(packageData: Omit<TokenPackage, 'pricePerToken' | 'savings'>): TokenPackage {
    const pricePerToken = packageData.price / packageData.tokens;
    const basePrice = 0.50; // Base price from starter package
    const savings = Math.round((1 - (pricePerToken / basePrice)) * 100);

    const newPackage = {
      ...packageData,
      pricePerToken,
      savings: savings > 0 ? savings : 0,
      isActive: true,
    };

    this.packages.set(packageData.id, newPackage);
    return newPackage;
  }

  deletePackage(id: string): boolean {
    // Don't actually delete, just mark as inactive
    const pkg = this.packages.get(id);
    if (pkg) {
      pkg.isActive = false;
      this.packages.set(id, pkg);
      return true;
    }
    return false;
  }

  getPackageStats(): any {
    const packages = this.getAllPackages(true);
    return {
      totalPackages: packages.length,
      activePackages: packages.filter(p => p.badge === 'active').length,
      averagePrice: packages.reduce((sum, p) => sum + p.price, 0) / packages.length,
      averageTokens: packages.reduce((sum, p) => sum + p.tokens, 0) / packages.length,
      priceRange: {
        min: Math.min(...packages.map(p => p.price)),
        max: Math.max(...packages.map(p => p.price)),
      },
      tokenRange: {
        min: Math.min(...packages.map(p => p.tokens)),
        max: Math.max(...packages.map(p => p.tokens)),
      },
    };
  }
}