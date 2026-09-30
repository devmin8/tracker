export function promptForPassword() {
	if (!process.stdin.isTTY) {
		throw new Error('A TTY is required to enter the password securely.');
	}

	return new Promise<string>((resolve, reject) => {
		let password = '';
		const stdin = process.stdin;
		const cleanup = () => {
			stdin.off('data', onData);
			stdin.setRawMode(false);
			stdin.pause();
			process.stdout.write('\n');
		};
		const onData = (data: Buffer) => {
			const input = data.toString();
			if (input === '\r' || input === '\n') {
				cleanup();
				resolve(password);
			} else if (input === '\u0003') {
				cleanup();
				reject(new Error('Password prompt cancelled'));
			} else if (input === '\u007f') {
				password = password.slice(0, -1);
			} else {
				password += input;
			}
		};

		process.stdout.write('Password: ');
		stdin.setRawMode(true);
		stdin.setEncoding('utf8');
		stdin.resume();
		stdin.on('data', onData);
	});
}
