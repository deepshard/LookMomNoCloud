# Truffle Desktop

## How to Run

### Prerequisites

- Python 3.12 (latest stable version)
- Bun
- npm

### Setup

1. Install Python 3.12

2. Set up a virtual environment:
```
python -m venv venv
source venv/bin/activate  # On Windows use venv\Scripts\activate
```

3. Install required Python packages:
```
pip install --pre -U -f https://mlc.ai/wheels mlc-ai-nightly
pip install --pre -U -f https://mlc.ai/wheels mlc-llm-nightly mlc-ai-nightly
```

4. Install requirements.txt:
`pip install -r requirements.txt`

5. Run migrations:
```
cd python
python3 migrations.py
```

6. Start the Python server:
`python3 server.py`

7. In a new terminal, run the CSS watcher:
`bun watch-css`

<details>
<summary>How to install Bun</summary>

1. For macOS or Linux:
   `curl -fsSL https://bun.sh/install | bash`

2. For Windows:
   - Install WSL2
   - Run the above curl command in your WSL2 terminal

For more details, visit [Bun's official installation guide](https://bun.sh/docs/installation)
</details>

8. In another terminal, you can either:
- Run Storybook:
  `npm run storybook`
- Or start the entire app:
  `bun start`

## Development

- To work on the frontend, use `npm run storybook`
- To run the full application, use `bun start`

## Notes

- Ensure all terminals are running in the project's root directory unless specified otherwise.
- Keep the Python server running while developing.

For any issues or further questions, please refer to the project documentation or open an issue in the repository.
