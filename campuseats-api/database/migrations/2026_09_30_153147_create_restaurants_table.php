<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('image')->nullable();
            $table->string('logo')->nullable();
            $table->text('description')->nullable();
            $table->string('address');
            $table->string('category')->nullable();
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('review_count')->default(0);
            $table->string('delivery_time')->nullable();
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->boolean('is_open')->default(true);
            $table->string('opening_time')->nullable();
            $table->string('closing_time')->nullable();
            $table->decimal('minimum_order', 8, 2)->default(0);
            $table->enum('approval_status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->boolean('blocked')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurants');
    }
};