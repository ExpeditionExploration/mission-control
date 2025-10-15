export class CircularBuffer<T> {
	private readonly buffer: Array<T | undefined>;
	private head = 0;
	private count = 0;

	public constructor(private readonly capacity: number) {
		if (!Number.isInteger(capacity) || capacity <= 0) {
			throw new Error('CircularBuffer requires a positive integer capacity.');
		}
		this.buffer = new Array<T | undefined>(capacity);
	}

	public push(value: T): void {
		if (this.count < this.capacity) {
			const tailIndex = (this.head + this.count) % this.capacity;
			this.buffer[tailIndex] = value;
			this.count += 1;
			return;
		}

		this.buffer[this.head] = value;
		this.head = (this.head + 1) % this.capacity;
	}

	public clear(): void {
		this.head = 0;
		this.count = 0;
		this.buffer.fill(undefined);
	}

	public toArray(): T[] {
		const result: T[] = [];
		for (let index = 0; index < this.count; index += 1) {
			const bufferIndex = (this.head + index) % this.capacity;
			const value = this.buffer[bufferIndex];
			if (value !== undefined) {
				result.push(value);
			}
		}
		return result;
	}

	public size(): number {
		return this.count;
	}

	public getCapacity(): number {
		return this.capacity;
	}
}
