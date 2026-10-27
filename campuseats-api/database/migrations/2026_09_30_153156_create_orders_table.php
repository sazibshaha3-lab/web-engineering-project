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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique(); // ORD-xxxxx
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rider_id')->nullable()->constrained('riders')->nullOnDelete();
            $table->foreignId('address_id')->nullable()->constrained('addresses')->nullOnDelete();
            $table->text('delivery_address'); // snapshot at order time
            $table->text('delivery_instructions')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 8, 2)->default(0);
            $table->decimal('discount', 8, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->enum('payment_method', ['cash', 'online'])->default('cash');
            $table->enum('payment_status', ['PENDING', 'PAID'])->default('PENDING');
            $table->enum('status', [
                'PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP',
                'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
            ])->default('PLACED');
            $table->timestamp('estimated_delivery_time')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};