FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN apk add --no-cache curl \
    && mkdir -p /data/photos
COPY --from=build /app/target/fashion-api-1.0.0.jar app.jar
ENV APP_UPLOAD_DIR=/data/photos
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
