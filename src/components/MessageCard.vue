<template>
	<div
		class="message-card"
		:class="{ unread: !message.read }"
		@click="$emit('mark-read', message.id)"
	>
		<div class="message-header">
			<div class="sender-container">
				<div class="unread-dot" v-if="!message.read"></div>
				<span class="sender-id">{{ message.sender }}</span>
			</div>
			<span class="timestamp">{{ formatTimeAgo(message.timestamp) }}</span>
		</div>
		<div class="message-text" :title="message.content">
			{{ truncatedContent(message.content) }}
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { PropType } from "vue";

	export interface NotificationMessage {
		id: string;
		sender: string;
		content: string;
		timestamp: Date;
		read: boolean;
	}

	const props = defineProps({
		message: {
			type: Object as PropType<NotificationMessage>,
			required: true,
		},
		maxContentLength: {
			type: Number,
			default: 40,
		},
	});

	const formatTimeAgo = (date: Date): string => {
		const now = new Date();
		const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
		if (diff < 1) return "agora mesmo";
		if (diff < 60) return `${diff} min atrás`;
		if (diff < 1440) return `${Math.floor(diff / 60)} h atrás`;
		return `${Math.floor(diff / 1440)} dias atrás`;
	};

	const truncatedContent = (content: string): string => {
		return content.length > props.maxContentLength
			? content.slice(0, props.maxContentLength - 3) + "..."
			: content;
	};
</script>

<style scoped>
	.message-card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		cursor: pointer;
		transition: background-color 0.2s ease;
		background-color: rgba(55, 164, 18, 0.141);
		border-radius: 8px;
	}

	.message-card:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	.message-card.unread {
		background-color: rgba(225, 107, 2, 0.08);
	}

	.message-card.unread:hover {
		background-color: rgba(225, 106, 2, 0.158);
	}

	.sender-container {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.unread-dot {
		width: 6px;
		height: 6px;
		background-color: #e16b02;
		border-radius: 50%;
	}

	.sender-id {
		padding-right: 70px;
		font-weight: 500;
		color: #fff;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.message-header {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.timestamp {
		position: absolute;
		top: 0;
		right: 0;
		/* color: #a1a1aa; */
		color: #b2b2bb;
		font-size: 14px;
		white-space: nowrap;
	}

	.message-text {
		color: #d4d4d8;
		font-size: 1rem;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%;
	}
</style>
