'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('tasks', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('Pending', 'In Progress', 'Done'),
        allowNull: false,
        defaultValue: 'Pending',
      },
      priority: {
        type: Sequelize.ENUM('Low', 'Medium', 'High'),
        allowNull: false,
        defaultValue: 'Medium',
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Add indexes for common query patterns
    await queryInterface.addIndex('tasks', ['projectId'], {
      name: 'tasks_project_id_index',
    });
    await queryInterface.addIndex('tasks', ['status'], {
      name: 'tasks_status_index',
    });
    await queryInterface.addIndex('tasks', ['priority'], {
      name: 'tasks_priority_index',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('tasks');
  },
};
