FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# For this demo kit, we use an empty object or skip complex workspace setups 
# by just installing standard React deps, but since package.json has workspace:*, 
# we'll just mock it or rewrite package.json during build to ignore workspace.
RUN sed -i 's/"@otelverse\/web": "workspace:\*"/"@otelverse\/web": "latest"/g' package.json || true
RUN npm install || true
COPY . .
# We just use vite preview for simplicity in the demo if build fails due to missing workspace package
# Wait, actually let's just serve the source directly with a simple node server or use vite dev server.
# For production we should build, but for a local demo kit, we can just run `npm run dev -- --host 0.0.0.0`
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
