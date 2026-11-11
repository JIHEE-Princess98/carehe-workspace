CREATE TABLE IF NOT EXISTS tb_document_environments (
  document_id BIGINT NOT NULL,
  environment_id BIGINT NOT NULL,
  PRIMARY KEY (document_id, environment_id),
  CONSTRAINT fk_document_environment_document FOREIGN KEY (document_id) REFERENCES tb_planning_documents(document_id),
  CONSTRAINT fk_document_environment_environment FOREIGN KEY (environment_id) REFERENCES tb_service_environments(environment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='기획문서 적용 환경';

CREATE TABLE IF NOT EXISTS tb_document_history (
  history_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NOT NULL,
  action_type VARCHAR(30) NOT NULL,
  changed_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_document_history_document FOREIGN KEY (document_id) REFERENCES tb_planning_documents(document_id),
  CONSTRAINT fk_document_history_user FOREIGN KEY (changed_by) REFERENCES tb_users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='기획문서 이력';

CREATE TABLE IF NOT EXISTS tb_attachments (
  attachment_id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  document_id BIGINT NULL,
  requirement_id BIGINT NULL,
  issue_id BIGINT NULL,
  comment_id BIGINT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(100) NULL,
  file_size BIGINT NULL,
  created_by BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_attachment_target CHECK ((document_id IS NOT NULL) + (requirement_id IS NOT NULL) + (issue_id IS NOT NULL) + (comment_id IS NOT NULL) = 1),
  CONSTRAINT fk_attachment_document FOREIGN KEY (document_id) REFERENCES tb_planning_documents(document_id),
  CONSTRAINT fk_attachment_requirement FOREIGN KEY (requirement_id) REFERENCES tb_requirements(requirement_id),
  CONSTRAINT fk_attachment_issue FOREIGN KEY (issue_id) REFERENCES tb_issues(issue_id),
  CONSTRAINT fk_attachment_comment FOREIGN KEY (comment_id) REFERENCES tb_comments(comment_id),
  CONSTRAINT fk_attachment_user FOREIGN KEY (created_by) REFERENCES tb_users(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='첨부파일';
