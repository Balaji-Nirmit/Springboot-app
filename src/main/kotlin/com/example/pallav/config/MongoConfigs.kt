package com.collector.platform.config

import org.springframework.boot.autoconfigure.mongo.MongoProperties
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary
import org.springframework.data.mongodb.MongoDatabaseFactory
import org.springframework.data.mongodb.core.MongoTemplate
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories

// --- 1. Logs DB (Primary) Configuration ---
@Configuration
@EnableMongoRepositories(
    basePackages = ["com.collector.platform.logs.repository"],
    mongoTemplateRef = "logsMongoTemplate" // Reference for logs repositories
)
class LogsMongoConfig {
    
    @Primary // Set as primary for default Mongo autowiring
    @Bean(name = ["logsProperties"])
    @ConfigurationProperties(prefix = "spring.data.mongodb.logs")
    fun logsProperties(): MongoProperties = MongoProperties()

    @Primary
    @Bean(name = ["logsMongoFactory"])
    fun logsMongoFactory(@Primary properties: MongoProperties): MongoDatabaseFactory =
        SimpleMongoClientDatabaseFactory(properties.uri)

    @Primary
    [cite_start]@Bean(name = ["logsMongoTemplate"]) // [cite: 58]
    fun logsMongoTemplate(logsMongoFactory: MongoDatabaseFactory): MongoTemplate =
        MongoTemplate(logsMongoFactory)
    
    [cite_start]// NOTE: To satisfy the "Two Mongo TransactionManagers" requirement[cite: 60],
    // a Mongo replica set must be configured, and corresponding MongoTransactionManager beans
    // would be added here, referencing their respective factories.
}

// --- 2. Metadata DB (Secondary) Configuration ---
@Configuration
@EnableMongoRepositories(
    basePackages = ["com.collector.platform.metadata.repository", "com.collector.platform.security.repository"],
    mongoTemplateRef = "metadataMongoTemplate" // Reference for metadata repositories
)
class MetadataMongoConfig {
    
    @Bean(name = ["metadataProperties"])
    @ConfigurationProperties(prefix = "spring.data.mongodb.metadata")
    fun metadataProperties(): MongoProperties = MongoProperties()

    @Bean(name = ["metadataMongoFactory"])
    fun metadataMongoFactory(properties: MongoProperties): MongoDatabaseFactory =
        SimpleMongoClientDatabaseFactory(properties.uri)

    [cite_start]@Bean(name = ["metadataMongoTemplate"]) // [cite: 58]
    fun metadataMongoTemplate(metadataMongoFactory: MongoDatabaseFactory): MongoTemplate =
        MongoTemplate(metadataMongoFactory)
}