type XhrOptions = {
	url: string;
	method?: string;
	body?: XMLHttpRequestBodyInit | null;
	onProgress?: (progress: number) => void;
};

export function xhr<T>({ url, method = 'POST', body = null, onProgress }: XhrOptions): Promise<T> {
	return new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();

		request.upload.addEventListener('progress', (event) => {
			if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
		});

		request.addEventListener('load', () => {
			let data: { message?: string } | null = null;
			try {
				data = JSON.parse(request.responseText);
			} catch {
				// empty or non-JSON body
			}

			if (request.status >= 200 && request.status < 300) {
				resolve(data as T);
				return;
			}

			reject(new Error(data?.message ?? 'Request failed'));
		});

		request.addEventListener('error', () => reject(new Error('Network error')));
		request.open(method, url);
		request.send(body);
	});
}
