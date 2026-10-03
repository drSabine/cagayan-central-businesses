<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// No name, contact, or network address is ever stored (privacy-rules.md, P12).
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wishes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('municipality_id')->constrained()->restrictOnDelete();
            $table->foreignId('business_type_id')->constrained()->restrictOnDelete();
            $table->string('reason', 280)->nullable();
            $table->string('submitter_hash', 64);
            $table->timestamps();

            $table->index(['municipality_id', 'business_type_id']);
            $table->index(['submitter_hash', 'created_at']);
        });

        Schema::create('wish_edits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wish_id')->constrained()->cascadeOnDelete();
            $table->timestamp('edited_at');

            $table->index(['wish_id', 'edited_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wish_edits');
        Schema::dropIfExists('wishes');
    }
};
