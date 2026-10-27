<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up(): void
{
    Schema::table('foods', function (Blueprint $table) {
        $table->string('preparation_time', 30)->nullable()->change();
    });

    Schema::table('riders', function (Blueprint $table) {
        $table->enum('approval_status', ['PENDING', 'APPROVED', 'REJECTED', 'BLOCKED'])
            ->default('PENDING')->change();
    });

    Schema::table('users', function (Blueprint $table) {
        $table->string('status', 20)->default('active')->after('role'); // active | inactive | blocked
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('status');
    });
}
};
