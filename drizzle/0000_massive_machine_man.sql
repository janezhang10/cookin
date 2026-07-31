CREATE TABLE `Ingredient` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalizedName` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Ingredient_normalizedName_key` ON `Ingredient` (`normalizedName`);--> statement-breakpoint
CREATE INDEX `Ingredient_name_idx` ON `Ingredient` (`name`);--> statement-breakpoint
CREATE TABLE `RecipeIngredient` (
	`id` text PRIMARY KEY NOT NULL,
	`recipeId` text NOT NULL,
	`ingredientId` text NOT NULL,
	`quantity` real,
	`unitId` text,
	`preparation` text,
	`optional` integer DEFAULT false NOT NULL,
	`displayOrder` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredientId`) REFERENCES `Ingredient`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `RecipeIngredient_recipeId_idx` ON `RecipeIngredient` (`recipeId`);--> statement-breakpoint
CREATE INDEX `RecipeIngredient_ingredientId_idx` ON `RecipeIngredient` (`ingredientId`);--> statement-breakpoint
CREATE TABLE `RecipeStepIngredientUsage` (
	`id` text PRIMARY KEY NOT NULL,
	`recipeStepId` text NOT NULL,
	`recipeIngredientId` text NOT NULL,
	`quantity` real NOT NULL,
	`displayOrder` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`recipeStepId`) REFERENCES `RecipeStep`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipeIngredientId`) REFERENCES `RecipeIngredient`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `RecipeStepIngredientUsage_recipeStepId_idx` ON `RecipeStepIngredientUsage` (`recipeStepId`);--> statement-breakpoint
CREATE INDEX `RecipeStepIngredientUsage_recipeIngredientId_idx` ON `RecipeStepIngredientUsage` (`recipeIngredientId`);--> statement-breakpoint
CREATE TABLE `RecipeStep` (
	`id` text PRIMARY KEY NOT NULL,
	`recipeId` text NOT NULL,
	`stepNumber` integer NOT NULL,
	`markdown` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL,
	FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RecipeStep_recipeId_stepNumber_key` ON `RecipeStep` (`recipeId`,`stepNumber`);--> statement-breakpoint
CREATE INDEX `RecipeStep_recipeId_idx` ON `RecipeStep` (`recipeId`);--> statement-breakpoint
CREATE TABLE `RecipeTag` (
	`id` text PRIMARY KEY NOT NULL,
	`recipeId` text NOT NULL,
	`tagId` text NOT NULL,
	`displayOrder` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`recipeId`) REFERENCES `Recipe`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tagId`) REFERENCES `Tag`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `RecipeTag_recipeId_tagId_key` ON `RecipeTag` (`recipeId`,`tagId`);--> statement-breakpoint
CREATE INDEX `RecipeTag_recipeId_idx` ON `RecipeTag` (`recipeId`);--> statement-breakpoint
CREATE INDEX `RecipeTag_tagId_idx` ON `RecipeTag` (`tagId`);--> statement-breakpoint
CREATE TABLE `Recipe` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`isFavorite` integer DEFAULT false NOT NULL,
	`photoKey` text,
	`photoMimeType` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Recipe_slug_key` ON `Recipe` (`slug`);--> statement-breakpoint
CREATE INDEX `Recipe_title_idx` ON `Recipe` (`title`);--> statement-breakpoint
CREATE TABLE `Tag` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`normalizedName` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Tag_normalizedName_key` ON `Tag` (`normalizedName`);--> statement-breakpoint
CREATE INDEX `Tag_name_idx` ON `Tag` (`name`);--> statement-breakpoint
CREATE TABLE `Unit` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Unit_name_key` ON `Unit` (`name`);